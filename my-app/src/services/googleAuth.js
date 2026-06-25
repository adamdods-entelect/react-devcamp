import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { requestToken } from './authService'

// Derives a stable backend password from the Firebase UID so the same Google
// account always maps to the same backend credentials -- no separate password
// store, and returning users can log into the backend without re-registering.
// The trailing 'Aa1!' guarantees the backend's complexity rules are satisfied.
// NOTE: deterministic-from-UID is a DevCamp-grade compromise, not production-secure;
// anyone who learns the scheme + a user's UID could derive their backend password.
export async function deriveBackendPassword(uid) {
  const bytes = new TextEncoder().encode(`itg:${uid}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64.slice(0, 20) + 'Aa1!'
}

// Runs the Google sign-in popup, then tries to log into the backend with the
// derived password. Resolves to one of:
//   { kind: 'existing', user, token }
//       this email signed up with Google before -> caller stores the JWT, done.
//   { kind: 'exists', email }
//       this email registered with email + password, not Google. Google can't
//       reproduce that password (and the backend has no reset), so the caller
//       sends them to email/password sign-in instead.
//   { kind: 'new', user, email, firstName, lastName, password }
//       brand-new Google user -> caller routes into the profile step to collect
//       the ID number, then provisions the backend with this email + password.
// Throws on a cancelled popup (auth/* code) or a backend/server failure (err.reason).
export async function signInWithGoogle() {
  let user
  try {
    ;({ user } = await signInWithPopup(auth, googleProvider))
  } catch (err) {
    // Enumeration-protection projects throw this instead of linking when the
    // email already belongs to a password account.
    if (err.code === 'auth/account-exists-with-different-credential') {
      return { kind: 'exists', email: err.customData?.email }
    }
    throw err
  }

  const password = await deriveBackendPassword(user.uid)
  const [firstName = '', lastName = ''] = (user.displayName || '').trim().split(/\s+/)

  const result = await requestToken(user.email, password)
  if (result.ok) {
    return { kind: 'existing', user, token: result.token }
  }
  if (result.reason === 'invalid') {
    // Derived password didn't work. If this Firebase account also carries a
    // password credential, the email was registered with email + password
    // (Google links to the same account), so they must sign in that way.
    const hasPassword = user.providerData.some((p) => p.providerId === 'password')
    if (hasPassword) {
      return { kind: 'exists', email: user.email }
    }
    // genuinely new Google user -> provision the backend in the profile step
    return { kind: 'new', user, email: user.email, firstName, lastName, password }
  }

  const err = new Error(`backend ${result.reason}`)
  err.reason = result.reason
  throw err
}
