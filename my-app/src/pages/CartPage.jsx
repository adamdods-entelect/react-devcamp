import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useCart from '../hooks/useCart'
import { setQty, removeFromCart } from '../services/cart'
import TopNav from '../components/home/TopNav'
import BottomNav from '../components/home/BottomNav'
import CreateAccountSheet from '../components/product/CreateAccountSheet'
import { cartTotals } from '../utils/cartTotals'
import { productImage } from '../utils/productImage'
import { getKycStatus } from '../services/kycStorage'
import { getProfile } from '../services/profile'
import emptyCart from '../assets/empty-cart.png'

function CartPage() {
  const navigate = useNavigate()
  const { status } = useAuth()
  const items = useCart()
  const [showSheet, setShowSheet] = useState(false)

  // Checkout requires a completed KYC upload (proof of residence + selfie).
  // null = still loading; false = one or both missing; true = both uploaded.
  const [kycComplete, setKycComplete] = useState(null)
  useEffect(() => {
    if (status !== 'authenticated') return
    let active = true
    getProfile()
      .then((p) => (p ? getKycStatus(p.id) : null))
      .then((s) => active && setKycComplete(!!(s && s.residence && s.selfie)))
      .catch(() => active && setKycComplete(false))
    return () => {
      active = false
    }
  }, [status])

  const handleCheckout = () => {
    if (status === 'guest') {
      setShowSheet(true) // must create an account / log in to check out
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-svh flex-col">
        <TopNav />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-24">
          <h1 className="pt-6 text-center text-2xl font-bold">Cart</h1>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <img src={emptyCart} alt="" className="w-60" />
            <p className="mt-4 text-lg font-bold">Your cart is empty</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 py-3 font-semibold text-white"
          >
            Continue browsing
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  const { once, monthly, payNow } = cartTotals(items)
  // Block a logged-in user from paying until KYC is complete (and while it loads).
  const checkoutBlocked = status === 'authenticated' && kycComplete !== true

  return (
    <>
      <TopNav />
      <div className="mx-auto max-w-md px-6 pb-48 md:max-w-5xl md:pb-12">
        <h1 className="pt-6 text-center text-2xl font-bold">Cart</h1>

        <div className="md:mt-4 md:flex md:items-start md:gap-8">
          <ul className="mt-2 md:mt-0 md:flex-1">
            {items.map((item) => (
              <li key={`${item.id}-${item.billing}`} className="flex gap-4 border-b border-gray-100 py-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img src={productImage(item)} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold leading-tight">{item.name}</p>
                    <button
                      onClick={() => removeFromCart(item.id, item.billing)}
                      aria-label={`Remove ${item.name}`}
                      className="shrink-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {item.billing === 'once' ? `R${item.price} once off` : `from R${item.price} p/m`}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-gray-400">
                    <button
                      onClick={() => setQty(item.id, item.billing, item.qty - 1)}
                      aria-label={`Decrease ${item.name}`}
                    >
                      <MinusCircle className="h-6 w-6" />
                    </button>
                    <span className="w-4 text-center font-medium text-gray-900">{item.qty}</span>
                    <button
                      onClick={() => setQty(item.id, item.billing, item.qty + 1)}
                      aria-label={`Increase ${item.name}`}
                    >
                      <PlusCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* mobile: fixed bottom bar — desktop: sticky summary card on the right */}
          <aside className="fixed inset-x-0 bottom-14 mx-auto w-full max-w-md border-t border-gray-100 bg-white px-6 pb-4 pt-4 md:sticky md:inset-x-auto md:bottom-auto md:top-6 md:mx-0 md:w-80 md:max-w-none md:shrink-0 md:rounded-2xl md:border md:p-6">
            <div className="flex items-start justify-between">
              <span className="text-lg font-bold">Total</span>
              <div className="space-y-1 text-sm">
                {once > 0 && (
                  <div className="flex justify-end gap-8">
                    <span className="text-gray-500">Once off</span>
                    <span className="font-bold">R {once.toFixed(2)}</span>
                  </div>
                )}
                {monthly > 0 && (
                  <div className="flex justify-end gap-8">
                    <span className="text-gray-500">Monthly</span>
                    <span className="font-bold">R {monthly.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkoutBlocked}
              className={`mt-4 w-full rounded-full py-3 font-semibold transition-colors ${
                checkoutBlocked
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white'
              }`}
            >
              Pay now (R{payNow.toFixed(2)})
            </button>
            {kycComplete === false && (
              <p className="mt-2 text-center text-sm text-gray-500">
                Upload both KYC documents to check out.{' '}
                <button
                  onClick={() => navigate('/kyc')}
                  className="font-semibold text-blue-600"
                >
                  Complete KYC
                </button>
              </p>
            )}
          </aside>
        </div>
      </div>
      <CreateAccountSheet open={showSheet} onClose={() => setShowSheet(false)} />
      <BottomNav />
    </>
  )
}

export default CartPage
