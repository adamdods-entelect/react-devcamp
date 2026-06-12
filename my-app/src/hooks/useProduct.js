import { useState, useEffect } from 'react'
import { fetchProduct, fetchProducts } from '../services/productService'

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
        if (!cancelled) setRelated(list.filter((p) => p.id !== Number(id)))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [id])

  return { product, related, error }
}

export default useProduct
