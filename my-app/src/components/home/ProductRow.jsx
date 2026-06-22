import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'

function ProductRow({ title, viewAllTo, products, loading }) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link
          to={viewAllTo}
          className="flex items-center gap-1 text-sm font-semibold text-blue-600"
        >
          View all →
        </Link>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[160px] shrink-0 animate-pulse rounded-xl border border-gray-200 p-3">
                <div className="aspect-square rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
              </div>
            ))
          : products.map((p) => (
              <div key={p.id} className="w-[160px] shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  )
}

export default ProductRow
