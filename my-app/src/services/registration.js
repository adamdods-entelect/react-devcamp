import { requestToken } from './authService'

const CUSTOMER_TYPE_INDIVIDUAL = 1

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
}) {
  const user = await createUser(email, password)
  if (!user.ok) return user

  const auth = await requestToken(email, password)
  if (!auth.ok) return { ok: false, reason: 'auth' }

  const profile = await createProfile(auth.token, {
    email,
    firstName,
    lastName,
    idNumber,
    customerTypeId,
  })
  if (!profile.ok) return profile

  return { ok: true, token: auth.token, customer: profile.customer }
}
