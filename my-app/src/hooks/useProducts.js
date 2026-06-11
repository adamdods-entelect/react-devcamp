import { useState, useEffect } from 'react'

function useProducts() {
    const [products, setProducts] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false
        fetch('/client/v1/products')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json()
            })
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