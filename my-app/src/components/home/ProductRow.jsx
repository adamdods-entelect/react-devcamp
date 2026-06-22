import { Link } from 'react-router-dom'

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
              <div key={i} className="w-[160px] shrink-0 animate-pulse">
                <div className="aspect-square rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
              </div>
            ))
          : products.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="w-[160px] shrink-0"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-white">
                  <img
                    src={p.imageUrl || 'https://picsum.photos/300'}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 font-semibold text-gray-900">{p.name}</p>
                <p className="text-sm text-gray-500">from R{p.price} p/m</p>
              </Link>
            ))}
      </div>
    </section>
  )
}

export default ProductRow
