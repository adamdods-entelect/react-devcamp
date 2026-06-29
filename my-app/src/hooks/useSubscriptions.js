import { useCallback, useEffect, useState } from 'react'
import { fetchSubscriptions } from '../services/subscriptions'
import { getPending, removePending } from '../services/pendingSubscriptions'

// Loads the customer's subscriptions: the backend's active ones merged with any
// locally-tracked pending ones (taken up but checks not passed yet). Follows the
// same shape as useProducts: loading is derived and state is only set from async
// callbacks. reload() bumps a key to re-run after a cancel or a fresh take-up.
export default function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(null)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchSubscriptions()
      .then((active) => {
        if (cancelled) return
        const activeIds = new Set(active.map((s) => s.id))
        // Drop any local pending the backend now has (verified), and show the rest.
        const pending = getPending().filter((p) => {
          if (activeIds.has(p.id)) {
            removePending(p.id)
            return false
          }
          return true
        })
        setSubscriptions([
          ...active.map((s) => ({ ...s, pending: false })),
          ...pending.map((p) => ({ ...p, subscriptionId: `pending-${p.id}`, pending: true })),
        ])
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your subscriptions.')
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])
  const loading = subscriptions === null && !error

  return { subscriptions: subscriptions ?? [], loading, error, reload }
}
