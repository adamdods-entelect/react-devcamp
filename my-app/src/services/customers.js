// Reads the Customer Information Store to detect a duplicate SA ID registration,
// used to seed the DHA Duplicate ID check with a real value at checkout (instead
// of a self-declaration at registration). GET /v1/customers returns every
// customer, including their id and idNumber.

// True if THIS customer is a duplicate registration of `idNumber` — i.e. an
// earlier customer already registered the same ID. The first registrant (lowest
// customer id) "owns" the ID and passes; only later duplicates are flagged, so a
// legitimate account isn't blocked by an imposter re-using its ID. Fail-safe:
// returns false (treat as unique) on any error, so a flaky call never wrongly
// blocks a customer at checkout.
export async function isDuplicateIdNumber(idNumber, customerId) {
  try {
    const token = localStorage.getItem('accessToken')
    const res = await fetch('/v1/customers', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return false
    const customers = await res.json()
    const ids = (Array.isArray(customers) ? customers : [])
      .filter((c) => c.idNumber === idNumber)
      .map((c) => c.id)
    // Unique, or we can't identify ourselves in the list -> don't block.
    if (ids.length <= 1 || !ids.includes(customerId)) return false
    // Duplicate only if an earlier customer (lower id) already holds this ID.
    return Math.min(...ids) !== customerId
  } catch {
    return false
  }
}
