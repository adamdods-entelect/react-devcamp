import { useEffect, useState } from 'react'
import { getCart } from '../services/cart'

// Reactive view of the cart. Re-reads on same-tab writes ('cart-changed') and
// on changes from other tabs ('storage').
export default function useCart() {
  const [items, setItems] = useState(getCart)

  useEffect(() => {
    const refresh = () => setItems(getCart())
    window.addEventListener('cart-changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('cart-changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return items
}
