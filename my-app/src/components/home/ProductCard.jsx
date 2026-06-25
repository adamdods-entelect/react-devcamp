import { Link } from 'react-router-dom'
import { productImage } from '../../utils/productImage'

function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="block h-full rounded-xl border border-gray-200 p-3"
    >
      <div className="aspect-square overflow-hidden rounded-lg bg-white">
        <img
          src={productImage(product)}
          alt={product.name}
          className="h-full w-full object-contain"
        />
      </div>
      <h3 className="mt-2 font-bold text-gray-900">{product.name}</h3>
      <p className="text-sm text-gray-500">from R{product.price} p/m</p>
    </Link>
  )
}

export default ProductCard