import { useState, useEffect } from 'react'

import '../App.css'
import TopBar from '../components/TopBar'
import ProductImage from '../components/ProductImage'
import ProductInfo from '../components/ProductInfo'
import RelatedProducts from '../components/RelatedProducts'
import PriceBar from '../components/PriceBar'

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

function ProductPage() {
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/client/v1/products/1')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => setProduct({ ...defaults, ...data }))
      .catch((err) => setError(err.message))

    fetch('/client/v1/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((list) => setRelated(list.filter((p) => p.id !== 1)))
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <main>Failed to load product: {error}</main>
  if (!product) return <main>Loading…</main>
  return (
    <main>
      <TopBar name={product.name} />
      <ProductImage imageUrl={product.imageUrl} discount={product.discount} />
      <ProductInfo 
        name={product.name} 
        description={product.description} 
        benefits={product.benefits}
        requirements={product.requirements}
        />
      <RelatedProducts products={related} />
      <PriceBar price={product.price} />
    </main>
  )
}

export default ProductPage