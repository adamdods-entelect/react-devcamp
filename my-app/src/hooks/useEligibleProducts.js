import { useEffect, useState } from 'react'
import { checkEligibility } from '../services/subscriptions'

// Narrows a product list to the ones the logged-in customer is eligible to take
// up (BRS US5: matching customer type + a qualifying account). When not enabled
// (guest / not logged in) the list passes through unchanged. State is set only
// from async callbacks and loading is derived (matching useProducts) to satisfy
// the react-hooks/set-state-in-effect rule.
export default function useEligibleProducts(products, enabled) {
  const [eligibleIds, setEligibleIds] = useState(null)
  const ids = products.map((p) => p.id)
  const key = ids.join(',')

  useEffect(() => {
    if (!enabled || ids.length === 0) return undefined
    let cancelled = false
    checkEligibility(ids)
      .then((results) => {
        if (cancelled) return
        setEligibleIds(new Set(results.filter((r) => r.isEligible).map((r) => r.productId)))
      })
      .catch(() => {
        if (!cancelled) setEligibleIds(new Set(ids)) // fail open — checkout still gates
      })
    return () => {
      cancelled = true
    }
    // `ids` is derived from `key`; re-run when the id set or enabled changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  if (!enabled) return { products, loading: false }
  if (eligibleIds === null) return { products: [], loading: true }
  return { products: products.filter((p) => eligibleIds.has(p.id)), loading: false }
}
