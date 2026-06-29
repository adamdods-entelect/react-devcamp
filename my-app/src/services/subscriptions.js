// Subscriptions = the products a customer has taken up. This is owned by the
// backend (US3 take-up, US5 eligibility), exposed under /client/v1/subscriptions
// and Bearer-authed with the app access token — NOT local storage.

const BASE = '/client/v1/subscriptions'

function authHeaders(extra) {
  const token = localStorage.getItem('accessToken')
  return { Authorization: `Bearer ${token}`, ...extra }
}

// GET the customer's subscriptions. Each subscription carries one or more
// products; we flatten them into display rows that keep their subscriptionId
// (needed to cancel). The catalogue returns empty imageUrl, so the UI still
// falls back to bundled images via productImage().
export async function fetchSubscriptions() {
  const res = await fetch(BASE, { headers: authHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return (data.subscriptions ?? []).flatMap((s) => {
    const products = Array.isArray(s.product) ? s.product : [s.product]
    return products
      .filter(Boolean)
      .map((p) => ({ subscriptionId: s.subscriptionId, ...p }))
  })
}

// POST eligibility (US5): which of these products the customer's type + accounts
// allow them to take up. Returns [{ isEligible, productId, failureReasons }].
export async function checkEligibility(productIds) {
  const res = await fetch(`${BASE}/eligibility`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ productIds }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// POST take-up (US3): actually subscribe to the products. A 200 means the
// products are active; a 422 means they were accepted but the fulfilment checks
// (KYC/fraud/credit/etc) haven't passed yet. Per the BRS those checks run
// asynchronously, so we treat 422 as "placed, pending" rather than a failure.
// Returns { ok, pending, pendingChecks } or { ok:false, reason } on a real error.
export async function takeUpProducts(productIds) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ productIds }),
  })
  if (res.status === 401) return { ok: false, reason: 'unauthorized' }
  if (res.status === 422) {
    const body = await res.json().catch(() => ({}))
    const pendingChecks = (body.fulfilmentResultList ?? [])
      .filter((c) => !c.passed)
      .map((c) => c.checkName)
    return { ok: true, pending: true, pendingChecks }
  }
  if (!res.ok) return { ok: false, reason: 'server' }
  return { ok: true, pending: false }
}

export async function cancelSubscription(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
}
