import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import crypto from 'node:crypto'

initializeApp()
const db = getFirestore()

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
const MAX_ATTEMPTS = 5
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const COOLDOWN_MS = 60 * 1000 // min gap between sends to the same email
const MAX_PER_HOUR = 5 // hard cap on sends per email per rolling hour
const HOUR_MS = 60 * 60 * 1000

// Throttles sends per email (run for BOTH the new and existing-account branches,
// before any email goes out). Race-safe via a transaction. Returns false when the
// caller should be silently rate-limited (we still return a generic ok to them).
async function allowSend(email) {
  const ref = db.collection('otpThrottle').doc(email)
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = Date.now()
    const data = snap.exists ? snap.data() : null

    if (data && now - data.lastSentAt < COOLDOWN_MS) return false // still cooling down

    let windowStart = data?.windowStart ?? now
    let count = data?.count ?? 0
    if (now - windowStart >= HOUR_MS) {
      windowStart = now // rolling window expired -> reset
      count = 0
    }
    if (count >= MAX_PER_HOUR) return false // hourly cap reached

    tx.set(ref, { lastSentAt: now, windowStart, count: count + 1 })
    return true
  })
}

// Codes are stored only as a salted hash, never in plaintext.
function hashCode(email, code) {
  return crypto.createHash('sha256').update(`${email}:${code}`).digest('hex')
}

async function userExists(email) {
  try {
    await getAuth().getUserByEmail(email)
    return true
  } catch (err) {
    if (err.code === 'auth/user-not-found') return false
    throw err
  }
}

// Hands the message to the "Trigger Email from Firestore" extension, which
// watches this collection and delivers it via the configured SMTP provider.
async function queueEmail(to, subject, html) {
  await db.collection('mail').add({ to, message: { subject, html } })
}

// Step 1: a user enters their email. We ALWAYS return a generic { ok: true } so
// the client can't tell whether the account already exists (anti-enumeration).
// New email  -> issue an OTP and email it.
// Known email -> email a "you already have an account, log in" notice, no OTP.
export const requestRegistrationOtp = onCall(async (request) => {
  const email = String(request.data?.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) {
    throw new HttpsError('invalid-argument', 'A valid email is required.')
  }

  // Rate-limit before sending anything. Generic ok on throttle -> no info leak.
  if (!(await allowSend(email))) {
    return { ok: true }
  }

  if (await userExists(email)) {
    await queueEmail(
      email,
      'You already have an account',
      `<p>Someone tried to register with this email, but an account already exists.</p>
       <p>Please <strong>log in</strong> instead. If this wasn't you, you can safely ignore this email.</p>`
    )
    return { ok: true }
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
  await db.collection('otps').doc(email).set({
    hash: hashCode(email, code),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    createdAt: FieldValue.serverTimestamp(),
  })
  await queueEmail(
    email,
    'Your verification code',
    `<p>Your verification code is:</p>
     <h2 style="letter-spacing:6px;font-family:monospace">${code}</h2>
     <p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>`
  )
  return { ok: true }
})

// Step 2: verify the typed code server-side. This only proves the user owns the
// email — the Firebase user and backend account are both created later, when the
// user submits the password step (see registration.js).
export const verifyOtp = onCall(async (request) => {
  const email = String(request.data?.email || '').trim().toLowerCase()
  const code = String(request.data?.code || '').trim()
  if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(code)) {
    throw new HttpsError('invalid-argument', 'Email and a 6-digit code are required.')
  }

  const ref = db.collection('otps').doc(email)
  const snap = await ref.get()
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Incorrect or expired code.')
  }

  const otp = snap.data()
  if (Date.now() > otp.expiresAt) {
    await ref.delete()
    throw new HttpsError('deadline-exceeded', 'This code has expired.')
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    await ref.delete()
    throw new HttpsError('resource-exhausted', 'Too many attempts. Request a new code.')
  }
  if (otp.hash !== hashCode(email, code)) {
    await ref.update({ attempts: FieldValue.increment(1) })
    throw new HttpsError('permission-denied', 'Incorrect or expired code.')
  }

  // Code matched. The account itself is created at the password step, not here.
  await ref.delete()
  return { ok: true }
})
