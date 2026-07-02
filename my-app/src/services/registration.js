import { createUserWithEmailAndPassword } from 'firebase/auth'
import { requestToken } from './authService'
import { auth } from './firebase'
import { seedMaritalStatus, seedLivingStatus } from './dha'

const CUSTOMER_TYPE_INDIVIDUAL = 1

// To take up a product a customer needs a *qualifying account* (BRS §13.3/FR6),
// not just the right customer type. We provision a sensible default account for
// the chosen customer type at registration so products become eligible:
//   INDIVIDUAL -> Gold Cheque (qualifies retail insurance, device, investments)
//   commercial types -> SME Checking (qualifies commercial products)
// Account type ids come from /client/v1/types.
const DEFAULT_ACCOUNT_BY_CUSTOMER_TYPE = {
  1: 1, // INDIVIDUAL  -> Gold Cheque Account
  2: 6, // SOLE PROP   -> SME Checking Account
  3: 6, // NON-PROFIT  -> SME Checking Account
  4: 6, // CIPC        -> SME Checking Account
}

// Link an account type to the logged-in customer's profile (PUT, returns 204).
// Best-effort: a failure here only means some products stay ineligible, so it
// must not fail an otherwise-complete registration.
async function linkDefaultAccount(token, customerTypeId) {
  const accountTypeId = DEFAULT_ACCOUNT_BY_CUSTOMER_TYPE[customerTypeId] ?? 1
  try {
    await fetch(`/client/v1/profile/accounts/${accountTypeId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (err) {
    console.error('Linking default account failed:', err)
  }
}

// Mirror the account into Firebase Auth, created at the same time as the backend
// account (on password submit). This is what the OTP "already exists -> log in"
// check looks for, and it gives the user a Firebase session for Storage/KYC.
// Best-effort: a failure here (e.g. provider disabled, or the email is already a
// Firebase user from a Google sign-in) must never fail a completed registration.
async function ensureFirebaseUser(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password)
  } catch (err) {
    if (err.code !== 'auth/email-already-in-use') {
      console.error('Firebase user creation failed:', err)
    }
  }
}

// Seed the DHA statuses the customer declared at registration (marital + living)
// so the fulfilment checks can pass at take-up. Duplicate ID is NOT seeded here —
// it's computed from the customer store at checkout. Best-effort: a failure only
// means some products stay declined until set — it must not fail an otherwise-
// complete registration. Keyed by the ID number (not customer id), and uses the
// freshly-issued token (not yet in localStorage).
async function seedDhaStatuses(token, idNumber, { maritalStatus, livingStatus }) {
  const seeds = []
  if (maritalStatus) seeds.push(seedMaritalStatus(idNumber, maritalStatus, token))
  if (livingStatus) seeds.push(seedLivingStatus(idNumber, livingStatus, token))
  await Promise.all(seeds.map((p) => p.catch((e) => console.error('DHA seed failed:', e))))
}

// Step 1: create the login credentials (auth service).
async function createUser(username, password) {
  const res = await fetch('/v1/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (res.status === 400) return { ok: false, reason: 'duplicate' } // username already exists
  if (!res.ok) return { ok: false, reason: 'server' }
  return { ok: true }
}

// Step 3: create the customer profile (client service, needs the bearer token).
async function createProfile(token, profile) {
  const res = await fetch('/client/v1/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  })
  if (res.status === 400) return { ok: false, reason: 'duplicate' } // profile already exists
  if (res.status === 401 || res.status === 403) return { ok: false, reason: 'unauthorized' }
  if (!res.ok) return { ok: false, reason: 'server' }
  return { ok: true, customer: await res.json() }
}

// Orchestrates the full registration:
//   1. create login credentials   POST /v1/user
//   2. log in to get a JWT         POST /v1/token  (reuses authService.requestToken)
//   3. create the customer profile POST /client/v1/profile  (Bearer token)
// Returns { ok, token, customer } on success, or { ok:false, reason } on failure.
export async function registerCustomer({
  email,
  password,
  firstName,
  lastName,
  idNumber,
  customerTypeId = CUSTOMER_TYPE_INDIVIDUAL,
  maritalStatus,
  livingStatus,
}) {
  const user = await createUser(email, password)
  if (!user.ok) return user

  const tokenResult = await requestToken(email, password)
  if (!tokenResult.ok) return { ok: false, reason: 'auth' }

  const profile = await createProfile(tokenResult.token, {
    email,
    firstName,
    lastName,
    idNumber,
    customerTypeId,
  })
  if (!profile.ok) return profile

  // Open a qualifying account so the customer can actually take up products.
  await linkDefaultAccount(tokenResult.token, customerTypeId)

  // Seed the DHA statuses the user declared (marital + living) so the fulfilment
  // checks can pass at take-up. Best-effort, keyed by ID number.
  await seedDhaStatuses(tokenResult.token, idNumber, { maritalStatus, livingStatus })

  // Backend account is in place — mirror it into Firebase Auth (best-effort).
  await ensureFirebaseUser(email, password)

  return { ok: true, token: tokenResult.token, customer: profile.customer }
}
