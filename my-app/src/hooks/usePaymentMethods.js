import { useEffect, useState } from 'react'
import { subscribe } from '../services/paymentMethods'

// Reactive view of the current user's saved cards + which one is selected.
// Re-reads whenever a card is added/selected (via the 'payment-changed' event).
export default function usePaymentMethods() {
  const [state, setState] = useState({ cards: [], selectedId: null })

  useEffect(() => subscribe(setState), [])

  const selectedCard = state.cards.find((c) => c.id === state.selectedId) ?? null
  return { ...state, selectedCard }
}
