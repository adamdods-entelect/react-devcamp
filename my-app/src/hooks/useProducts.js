import { useState, useEffect } from 'react'
import { fetchProducts } from '../services/productService'

function useProducts() {
    const [products, setProducts] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false
        fetchProducts()
            .then((data) => {
                if (!cancelled) setProducts(data)
            })
            .catch((err) => {
                if (!cancelled) setError(err.message)
            })

        return () => {
            cancelled = true
        }
    }, [])

    const loading = !products && !error

    return { products, loading, error }
}

export default useProducts
