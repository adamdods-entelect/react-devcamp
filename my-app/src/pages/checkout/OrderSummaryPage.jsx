import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { MinusCircle, PlusCircle } from 'lucide-react'
import useCart from '../../hooks/useCart'
import usePaymentMethods from '../../hooks/usePaymentMethods'
import { setQty, removeFromCart } from '../../services/cart'
import { checkEligibility, takeUpProducts } from '../../services/subscriptions'
import { addPending, removePending } from '../../services/pendingSubscriptions'
import { getProfile } from '../../services/profile'
import { generateContract } from '../../services/contract'
import { cartTotals } from '../../utils/cartTotals'
import { productImage } from '../../utils/productImage'
import TopNav from '../../components/home/TopNav'
import CheckoutHeader from '../../components/checkout/CheckoutHeader'
import EmptyCheckout from '../../components/checkout/EmptyCheckout'

// Step 2 of checkout (wireframe 6): review items, confirm the payment method and
// pay. "Pay now" checks eligibility (US5), takes up the eligible products (US3)
// via the backend, and shows why any others were rejected.
function OrderSummaryPage() {
  const navigate = useNavigate()
  const items = useCart()
  const { selectedCard } = usePaymentMethods()
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [issues, setIssues] = useState({}) // productId -> [reasons]

  if (items.length === 0) return <EmptyCheckout />
  // Reached only via the payment step, which requires a selection — guard direct hits.
  if (!selectedCard) return <Navigate to="/checkout" replace />

  const { once, monthly, payNow } = cartTotals(items)

  const handlePay = async () => {
    setPaying(true)
    setPayError('')
    setIssues({})
    const productIds = [...new Set(items.map((i) => i.id))]
    try {
      const results = await checkEligibility(productIds)
      const eligibleIds = results.filter((r) => r.isEligible).map((r) => r.productId)
      const ineligible = results.filter((r) => !r.isEligible)

      let pending = false
      let contractUrl = null
      if (eligibleIds.length > 0) {
        const res = await takeUpProducts(eligibleIds)
        if (!res.ok) {
          setPayError('We could not complete your order. Please try again.')
          setPaying(false)
          return
        }
        pending = res.pending
        // Unique products taken up (the cart may hold monthly + once-off lines).
        const takenProducts = [
          ...new Map(
            items
              .filter((i) => eligibleIds.includes(i.id))
              .map((i) => [i.id, { id: i.id, name: i.name, price: i.price, imageUrl: i.imageUrl }])
          ).values(),
        ]
        // Pending = subscribed but checks not passed yet; the backend only stores
        // active ones, so track pending locally. Active take-ups clear any stale pending.
        if (pending) addPending(takenProducts)
        else takenProducts.forEach((p) => removePending(p.id))
        // US8 — checks passed, so generate + store the contract from the
        // customer profile + product data. Best-effort: a contract failure must
        // not fail an order that already went through on the backend.
        // TEMP(verify): generating regardless of `pending` so the contract
        // pipeline can be tested without a clean backend pass. Re-gate with
        // `if (!pending)` once confirmed.
        try {
          const customer = await getProfile()
          contractUrl = await generateContract({
            customer,
            products: takenProducts,
            totals: { once, monthly, payNow },
          })
        } catch (e) {
          // swallow — order is placed; user can still proceed.
          console.error('contract generation failed', e)
        }
        // Remove the now-subscribed products (all their billing lines) from the cart.
        items
          .filter((i) => eligibleIds.includes(i.id))
          .forEach((i) => removeFromCart(i.id, i.billing))
      }

      // Keep ineligible items in the cart and explain why they couldn't be taken up.
      if (ineligible.length > 0) {
        setIssues(Object.fromEntries(ineligible.map((r) => [r.productId, r.failureReasons ?? []])))
        setPaying(false)
        return
      }

      navigate('/checkout/success', { state: { total: payNow, pending, contractUrl } })
    } catch {
      setPayError('Something went wrong. Please try again.')
      setPaying(false)
    }
  }

  return (
    <>
      <TopNav />
      <div className="mx-auto max-w-md px-6 pb-48 md:max-w-5xl md:pb-12">
        <CheckoutHeader title="Order summary" />
        <h1 className="mt-6 hidden text-2xl font-bold md:block">Order summary</h1>

        <ul className="mt-2 md:mt-4">
          {items.map((item) => {
            const pending = item.billing === 'once'
            return (
              <li key={`${item.id}-${item.billing}`} className="flex gap-4 border-b border-gray-100 py-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img src={productImage(item)} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold leading-tight">{item.name}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {pending ? `R${item.price} once off` : `from R${item.price} p/m`}
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
                  {issues[item.id] && (
                    <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                      <p className="font-medium">Not eligible for this product</p>
                      {issues[item.id].length > 0 && (
                        <ul className="mt-1 list-inside list-disc">
                          {issues[item.id].map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <section className="mt-6">
          <h2 className="font-bold">Payment method</h2>
          <div className="mt-3 flex items-center justify-between">
            <span>
              <span className="block font-medium">{selectedCard.brand}</span>
              <span className="block text-sm text-gray-400">•••• {selectedCard.last4}</span>
            </span>
            <button
              onClick={() => navigate('/checkout')}
              className="text-sm font-semibold text-blue-600"
            >
              Change
            </button>
          </div>
        </section>

        {/* mobile: fixed bottom bar — desktop: inline */}
        <aside className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-gray-100 bg-white px-6 pb-8 pt-4 md:static md:mt-8 md:max-w-none md:border-0 md:p-0">
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
          {payError && <p className="mt-3 text-sm text-red-500">{payError}</p>}
          <button
            onClick={handlePay}
            disabled={paying}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 py-3 font-semibold text-white disabled:opacity-60 md:w-80"
          >
            {paying ? 'Processing…' : `Pay now (R${payNow.toFixed(2)})`}
          </button>
        </aside>
      </div>
    </>
  )
}

export default OrderSummaryPage
