import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import useProducts from '../hooks/useProducts'
import ProductCard from '../components/home/ProductCard'
import BottomNav from '../components/home/BottomNav'

function ProductGridPage({ title, range, select }) {
  const navigate = useNavigate()
  const { products, loading, error } = useProducts()
  const all = products || []
  const list = select ? select(all) : all.slice(range[0], range[1])

  return (
    <>
      <header className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{title}</h1>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        {error && (
          <p className="text-sm text-red-500">Couldn&apos;t load products: {error}</p>
        )}

        {loading ? (
          <div className="grid animate-pulse grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-3">
                <div className="aspect-square rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </>
  )
}

export default ProductGridPage
