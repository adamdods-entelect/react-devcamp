import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { subscribe } from '../services/cart'

export default function useCart() {
  const [items, setItems] = useState([])

  useEffect(() => {
    let unsubscribeCart = subscribe(setItems)
    const unsubscribeAuth = onAuthStateChanged(auth, () => {
      unsubscribeCart()
      unsubscribeCart = subscribe(setItems)
    })
    return () => {
      unsubscribeCart()
      unsubscribeAuth()
    }
  }, [])

  return items
}