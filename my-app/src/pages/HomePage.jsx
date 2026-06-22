import TopNav from '../components/home/TopNav'
import useProducts from '../hooks/useProducts'
import useAuth from '../hooks/useAuth'
import ProductCard from '../components/home/ProductCard'
import FeaturedBanner from '../components/home/FeaturedBanner'
import Header from '../components/home/Header'
import { useState, useMemo } from 'react'
import CategoryFilter from '../components/home/CategoryFilter'
import BottomNav from '../components/home/BottomNav'
import AuthedHome from './AuthedHome'
import { categories, getCategory } from '../utils/category'

function HomePage() {
  const { status } = useAuth()
  const { products, loading, error } = useProducts()
  const [category, setCategory] = useState('All')

  const visibleProducts = useMemo(() => {
    if (!products) return []
    if (category === 'All') return products
    return products.filter((p) => getCategory(p.name) === category)
  }, [products, category])

  if (status === 'authenticated') {
    return <AuthedHome products={products} loading={loading} error={error} />
  }

  return (
    <>
      <TopNav />
      <div className="md:hidden">
        <Header />
      </div>
      <main className="mx-auto max-w-6xl px-4 pb-20 md:pb-8">
        <FeaturedBanner loading={loading} />

        <h1 className="mb-3 mt-4 text-2xl font-bold">Discover</h1>
        <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />

      {error && (
        <p className="text-sm text-red-500">Couldn&apos;t load products: {error}</p>
      )}

      {loading && (
        <div className="grid animate-pulse grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-3">
              <div className="aspect-square rounded-lg bg-gray-200" />
              <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {products && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      </main>
      <BottomNav />
    </>
  )
}

export default HomePage