import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import useProducts from '../hooks/useProducts'
import useAuth from '../hooks/useAuth'
import useEligibleProducts from '../hooks/useEligibleProducts'
import ProductCard from '../components/home/ProductCard'
import BottomNav from '../components/home/BottomNav'
import TopNav from '../components/home/TopNav'

function ProductGridPage({ title, range, select, eligibleOnly = false }) {
  const navigate = useNavigate()
  const { status } = useAuth()
  const { products, loading, error } = useProducts()
  const all = products || []
  const base = select ? select(all) : range ? all.slice(range[0], range[1]) : all
  // Eligibility can only be checked for a logged-in customer; guests see all.
  const { products: list, loading: eligLoading } = useEligibleProducts(
    base,
    eligibleOnly && status === 'authenticated'
  )
  const showLoading = loading || eligLoading

  return (
    <>
      <TopNav />
      {/* mobile back header (desktop uses TopNav above) */}
      <header className="flex items-center gap-3 px-4 py-4 md:hidden">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{title}</h1>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-24 md:px-6 md:pb-8">
        <h1 className="mb-4 mt-6 hidden text-2xl font-bold md:block">{title}</h1>

        {error && (
          <p className="text-sm text-red-500">Couldn&apos;t load products: {error}</p>
        )}

        {showLoading ? (
          <div className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-3">
                <div className="aspect-square rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
