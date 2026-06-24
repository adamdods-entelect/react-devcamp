import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

const requestFn = httpsCallable(functions, 'requestRegistrationOtp')
const verifyFn = httpsCallable(functions, 'verifyOtp')

// Asks the backend to email a code. The response is intentionally generic
// (it never reveals whether the email already exists), so this only fails on
// a network/server error.
export async function sendRegistrationOtp(email) {
  try {
    await requestFn({ email })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

// Verifies the typed code server-side.
// Returns { ok: true } or { ok: false, reason } for the UI to message.
export async function verifyRegistrationOtp(email, code) {
  try {
    await verifyFn({ email, code })
    return { ok: true }
  } catch (err) {
    // FunctionsError codes look like 'functions/permission-denied'
    return { ok: false, reason: err.code, message: err.message }
  }
}
