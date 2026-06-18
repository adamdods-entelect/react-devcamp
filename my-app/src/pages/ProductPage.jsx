import { useParams } from 'react-router-dom'

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

  if (error) return <main className="p-4">Failed to load product: {error}</main>
  if (!product) return <ProductPageSkeleton />

  return (
    <main className="pb-[88px]">
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
