import TopNav from '../components/home/TopNav'
import Header from '../components/home/Header'
import FeaturedBanner from '../components/home/FeaturedBanner'
import ProductRow from '../components/home/ProductRow'
import BottomNav from '../components/home/BottomNav'
import { getNewArrivals } from '../utils/productSections'

function AuthedHome({ products, loading, error }) {
  const list = products || []
  const recommended = list.slice(0, 6)
  const newArrivals = getNewArrivals(list, 6)

  return (
    <>
      <TopNav />
      <div className="md:hidden">
        <Header />
      </div>
      <main className="mx-auto max-w-6xl px-4 pb-20 md:pb-8">
        <FeaturedBanner loading={loading} />

        {error && (
          <p className="text-sm text-red-500">Couldn&apos;t load products: {error}</p>
        )}

        <ProductRow
          title="Recommended for you"
          viewAllTo="/recommended"
          products={recommended}
          loading={loading}
        />
        <ProductRow
          title="New arrivals"
          viewAllTo="/new-arrivals"
          products={newArrivals}
          loading={loading}
        />
      </main>
      <BottomNav />
    </>
  )
}

export default AuthedHome
