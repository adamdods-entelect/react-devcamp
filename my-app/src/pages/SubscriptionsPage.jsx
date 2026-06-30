import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, Trash2 } from 'lucide-react'
import TopNav from '../components/home/TopNav'
import BottomNav from '../components/home/BottomNav'
import useSubscriptions from '../hooks/useSubscriptions'
import { cancelSubscription } from '../services/subscriptions'
import { removePending } from '../services/pendingSubscriptions'
import { productImage } from '../utils/productImage'

function SubscriptionsPage() {
  const { subscriptions, loading, error, reload } = useSubscriptions()
  const [cancelling, setCancelling] = useState(null)

  const handleCancel = async (sub) => {
    setCancelling(sub.subscriptionId)
    try {
      // Pending rows live only locally; active ones are deleted on the backend.
      if (sub.pending) removePending(sub.id)
      else await cancelSubscription(sub.subscriptionId)
      await reload()
    } finally {
      setCancelling(null)
    }
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 md:px-6 md:pb-8">
        <h1 className="text-2xl font-bold">Your subscriptions</h1>

        {loading ? (
          <p className="mt-6 text-gray-500">Loading your subscriptions…</p>
        ) : error ? (
          <div className="mt-6">
            <p className="text-red-500">{error}</p>
            <button
              onClick={reload}
              className="mt-3 rounded-full bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700"
            >
              Try again
            </button>
          </div>
        ) : subscriptions.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {subscriptions.map((s) => (
              <li
                key={s.subscriptionId}
                className="flex items-center gap-4 rounded-xl border border-gray-200 p-3"
              >
                <Link to={`/products/${s.id}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                  <img src={productImage(s)} alt="" className="h-full w-full object-contain" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${s.id}`} className="block truncate font-semibold text-gray-900">
                    {s.name}
                  </Link>
                  <p className="text-sm text-gray-500">R{Number(s.price).toFixed(2)} / month</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.pending ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {s.pending ? 'Pending verification' : 'Active'}
                  </span>
                </div>
                <button
                  onClick={() => handleCancel(s)}
                  disabled={cancelling === s.subscriptionId}
                  aria-label={`Cancel ${s.name}`}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-40"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <BottomNav />
    </>
  )
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Layers className="h-8 w-8" />
      </div>
      <p className="mt-4 font-semibold text-gray-900">No subscriptions yet</p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">
        Browse our products and subscribe to see them here.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-6 py-3 font-semibold text-white"
      >
        Browse products
      </Link>
    </div>
  )
}

export default SubscriptionsPage
