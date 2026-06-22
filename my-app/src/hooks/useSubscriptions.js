import { useEffect, useState } from 'react'
import { getSubscriptions } from '../services/subscriptions'

// Reactive view of the local subscriptions store. Re-reads on same-tab writes
// ('subscriptions-changed') and on changes from other tabs ('storage').
export default function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(getSubscriptions)

  useEffect(() => {
    const refresh = () => setSubscriptions(getSubscriptions())
    window.addEventListener('subscriptions-changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('subscriptions-changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return subscriptions
}
