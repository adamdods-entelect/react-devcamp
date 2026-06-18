import { useState, useEffect } from 'react'
import { fetchProduct, fetchProducts } from '../services/productService'
import { getCategory } from '../utils/category'

// fallback content for fields the catalogue may not return
const defaults = {
  discount: 25,
  benefits: [
    'Theft and loss recovery',
    'Comprehensive coverage',
    'Hardware malfunction coverage',
  ],
  requirements: [
    'Minimum age of 18 years old',
    'South African resident',
    'Have an account with us in good standing',
  ],
}

function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [error, setError] = useState(null)
  const [loadedId, setLoadedId] = useState(id)

  // reset when navigating to a different product (adjust state during render)
  if (id !== loadedId) {
    setLoadedId(id)
    setProduct(null)
    setRelated([])
    setError(null)
  }

  useEffect(() => {
    let cancelled = false

    fetchProduct(id)
      .then((data) => {
        if (!cancelled) setProduct({ ...defaults, ...data })
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    // related products are best-effort: a failure here must not blank the page
    fetchProducts()
      .then((list) => {
        if (cancelled) return
        const current = list.find((p) => p.id === Number(id))
        const others = list.filter((p) => p.id !== Number(id))
        // prefer products in the same category; fall back to all others if too few
        const sameCategory = current
          ? others.filter((p) => getCategory(p.name) === getCategory(current.name))
          : others
        setRelated(sameCategory.length >= 2 ? sameCategory : others)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [id])

  return { product, related, error }
}

export default useProduct
