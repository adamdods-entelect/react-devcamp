// Backend DHA (Department of Home Affairs) statuses — the fulfilment checks read
// these at take-up. Like KYC (services/kyc.js), they're seeded from what the user
// declares at registration. All take the customer's ID NUMBER (not the customer
// id) and are best-effort. `token` defaults to the stored access token but is
// passable, because during registration it isn't in localStorage yet.
//
// The endpoints are ADD-ONLY (POST appends a record), and the backend 500s when a
// check finds MULTIPLE records for one ID number — so seeding the same ID twice
// (e.g. re-registering with the same SA ID) corrupts it. To stay idempotent we
// DELETE any existing record first, then POST a single fresh one.

function seed(path, body, token) {
  const t = token ?? localStorage.getItem('accessToken')
  const auth = { Authorization: `Bearer ${t}` }
  return fetch(path, { method: 'DELETE', headers: auth })
    .catch(() => {}) // nothing to delete is fine
    .then(() =>
      fetch(path, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    )
    .then((res) => {
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
    })
}

// livingStatus: 'alive' | 'deceased'
export function seedLivingStatus(idNumber, livingStatus, token) {
  return seed(`/v1/status/living/${idNumber}`, { livingStatus }, token)
}

// hasDuplicateId: false = a single, valid ID document (passes the check)
export function seedDuplicateId(idNumber, hasDuplicateId, token) {
  return seed(`/v1/status/duplicateId/${idNumber}`, { hasDuplicateId }, token)
}

// status: 'Single' | 'Married' | 'Divorced' | 'Widowed'. Dates must be real —
// an empty effectiveTo is rejected with 400.
export function seedMaritalStatus(idNumber, status, token) {
  return seed(
    `/v1/status/marital/${idNumber}`,
    { status, effectiveFrom: '2020-01-01', effectiveTo: '2099-12-31' },
    token
  )
}

// --- reads (for display, e.g. the account page) ---
// Return the current value, or null when the record isn't set (404).

function read(path, token) {
  const t = token ?? localStorage.getItem('accessToken')
  return fetch(path, { headers: { Authorization: `Bearer ${t}` } }).then((res) => {
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  })
}

export function getMaritalStatus(idNumber, token) {
  return read(`/v1/status/marital/${idNumber}`, token).then((d) => d?.currentStatus?.status ?? null)
}

export function getLivingStatus(idNumber, token) {
  return read(`/v1/status/living/${idNumber}`, token).then((d) => d?.livingStatus ?? null)
}

export function getDuplicateId(idNumber, token) {
  return read(`/v1/status/duplicateId/${idNumber}`, token).then((d) => (d == null ? null : d.hasDuplicateId))
}
