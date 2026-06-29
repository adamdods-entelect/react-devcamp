import { useEffect, useState } from 'react'
import { checkEligibility } from '../services/subscriptions'

// Checks whether the logged-in customer may take up a product (BRS US5: matching
// customer type + a qualifying account). Only runs when `enabled` — guests have
// no profile to check against, so they're left to the checkout gate.
// State is set only from async callbacks (matching useProducts) and loading is
// derived, to satisfy the react-hooks/set-state-in-effect rule.
export default function useEligibility(productId, enabled) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!enabled || productId == null) return
    let cancelled = false
    checkEligibility([productId])
      .then((results) => {
        if (cancelled) return
        const match = results.find((r) => r.productId === productId)
        setResult({ eligible: match ? match.isEligible : true, reasons: match?.failureReasons ?? [] })
      })
      .catch(() => {
        // If the check itself fails, don't block — the checkout gate still applies.
        if (!cancelled) setResult({ eligible: true, reasons: [] })
      })
    return () => {
      cancelled = true
    }
  }, [productId, enabled])

  return {
    loading: enabled && result === null,
    eligible: result ? result.eligible : true,
    reasons: result?.reasons ?? [],
  }
}
