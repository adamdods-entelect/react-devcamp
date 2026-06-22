import { useParams } from 'react-router-dom'
import { useEffect } from 'react'

import useProduct from '../hooks/useProduct'
import ProductPageSkeleton from '../components/product/ProductPageSkeleton'
import TopBar from '../components/product/TopBar'
import ProductImage from '../components/product/ProductImage'
import ProductInfo from '../components/product/ProductInfo'
import RelatedProducts from '../components/product/RelatedProducts'
import PriceBar from '../components/product/PriceBar'

function ProductPage() {
  const { id } = useParams()
  const { product, related, error } = useProduct(id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])
  
  if (error) return <main className="p-4">Failed to load product: {error}</main>
  if (!product) return <ProductPageSkeleton />

  return (
    <main className="mx-auto max-w-5xl pb-[88px]">
      <TopBar name={product.name} />
      <div className="md:flex md:items-start md:gap-6">
        <div className="md:w-1/2">
          <ProductImage imageUrl={product.imageUrl} discount={product.discount} />
        </div>
        <div className="md:flex-1">
          <ProductInfo
            name={product.name}
            description={product.description}
            benefits={product.benefits}
            requirements={product.requirements}
          />
        </div>
      </div>
      <RelatedProducts products={related} />
      <PriceBar price={product.price} />
    </main>
  )
}

export default ProductPage
