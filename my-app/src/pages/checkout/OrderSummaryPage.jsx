import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { MinusCircle, PlusCircle } from 'lucide-react'
import useCart from '../../hooks/useCart'
import usePaymentMethods from '../../hooks/usePaymentMethods'
import { setQty, removeFromCart } from '../../services/cart'
import { checkEligibility, takeUpProducts } from '../../services/subscriptions'
import { removePending } from '../../services/pendingSubscriptions'
import { getProfile } from '../../services/profile'
import { seedDuplicateId } from '../../services/dha'
import { isDuplicateIdNumber } from '../../services/customers'
import { generateContract } from '../../services/contract'
import { cartTotals } from '../../utils/cartTotals'
import { productImage } from '../../utils/productImage'
import { checkLabel } from '../../utils/fulfilmentChecks'
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
  const [issues, setIssues] = useState({}) // productId -> [reasons] (US5 eligibility)
  const [declinedByProduct, setDeclinedByProduct] = useState({}) // productId -> [fulfilment reasons]
  const [approvedIds, setApprovedIds] = useState(null) // after a partial decline: ids that passed

  if (items.length === 0) return <EmptyCheckout />
  // Reached only via the payment step, which requires a selection — guard direct hits.
  if (!selectedCard) return <Navigate to="/checkout" replace />

  const { once, monthly, payNow } = cartTotals(items)
  const approvedTotal = approvedIds
    ? cartTotals(items.filter((i) => approvedIds.includes(i.id))).payNow
    : 0

  // Take up `explicitIds` if given (the "pay for approved only" retry), otherwise
  // run eligibility (US5) first and take up everything eligible.
  const attemptPayment = async (explicitIds) => {
    setPaying(true)
    setPayError('')
    try {
      let eligibleIds
      if (explicitIds) {
        eligibleIds = explicitIds
      } else {
        setIssues({})
        setDeclinedByProduct({})
        setApprovedIds(null)
        const productIds = [...new Set(items.map((i) => i.id))]
        const results = await checkEligibility(productIds)
        eligibleIds = results.filter((r) => r.isEligible).map((r) => r.productId)
        const ineligible = results.filter((r) => !r.isEligible)
        if (ineligible.length > 0) {
          setIssues(Object.fromEntries(ineligible.map((r) => [r.productId, r.failureReasons ?? []])))
        }
      }

      if (eligibleIds.length === 0) {
        setPaying(false)
        return
      }

      // Seed the DHA Duplicate ID check with a COMPUTED value: flag the ID as a
      // duplicate if more than one customer shares it (real detection, replacing
      // the old registration self-declaration). Best-effort — must not block the
      // take-up. `profile` is reused for the contract below.
      const profile = await getProfile().catch(() => null)
      if (profile?.idNumber) {
        try {
          await seedDuplicateId(
            profile.idNumber,
            await isDuplicateIdNumber(profile.idNumber, profile.id)
          )
        } catch (e) {
          console.error('duplicate-id seed failed', e)
        }
      }

      const res = await takeUpProducts(eligibleIds)
      if (!res.ok) {
        setPayError('We could not complete your order. Please try again.')
        setPaying(false)
        return
      }

      // Decline: attribute each failed check to its product(s) via productIds, so
      // we can highlight those items and offer to pay for the ones that passed.
      if (res.outcome === 'declined') {
        const byProduct = {}
        const failedIds = new Set()
        for (const c of res.failedChecks) {
          const reason = c.message
            ? `${checkLabel(c.name)}: ${c.message}`
            : `${checkLabel(c.name)} check did not pass`
          for (const pid of c.productIds ?? []) {
            ;(byProduct[pid] ??= []).push(reason)
            failedIds.add(pid)
          }
        }
        setDeclinedByProduct(byProduct)
        const approved = eligibleIds.filter((id) => !failedIds.has(id))
        setApprovedIds(approved.length ? approved : null)
        setPaying(false)
        return
      }

      // Passed: subscribe these products, generate the contract, clear them from
      // the cart, and confirm. Any declined items stay in the cart.
      const takenLines = items.filter((i) => eligibleIds.includes(i.id))
      const takenProducts = [
        ...new Map(
          takenLines.map((i) => [i.id, { id: i.id, name: i.name, price: i.price, imageUrl: i.imageUrl }])
        ).values(),
      ]
      const takenTotals = cartTotals(takenLines)
      takenProducts.forEach((p) => removePending(p.id))
      let contractUrl = null
      try {
        contractUrl = await generateContract({ customer: profile, products: takenProducts, totals: takenTotals })
      } catch (e) {
        console.error('contract generation failed', e)
      }
      takenLines.forEach((i) => removeFromCart(i.id, i.billing))
      navigate('/checkout/success', { state: { total: takenTotals.payNow, contractUrl } })
    } catch {
      setPayError('Something went wrong. Please try again.')
      setPaying(false)
    }
  }

  // Normal "Pay now" takes up everything eligible; after a partial decline the
  // button pays for just the approved products.
  const handlePay = () => attemptPayment(approvedIds ?? undefined)

  return (
    <>
      <TopNav />
      <div className="mx-auto max-w-md px-6 pb-48 md:max-w-5xl md:pb-12">
        <CheckoutHeader title="Order summary" />
        <h1 className="mt-6 hidden text-center text-2xl font-bold md:block">Order summary</h1>

        <ul className="mt-2 md:mt-4">
          {items.map((item) => {
            const pending = item.billing === 'once'
            return (
              <li
                key={`${item.id}-${item.billing}`}
                className={`flex gap-4 py-5 ${
                  declinedByProduct[item.id]
                    ? 'rounded-lg bg-red-50 px-2 ring-1 ring-red-200'
                    : 'border-b border-gray-100'
                }`}
              >
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
                  {declinedByProduct[item.id] && (
                    <div className="mt-2 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
                      <p className="font-medium">Not approved</p>
                      <ul className="mt-1 list-inside list-disc">
                        {declinedByProduct[item.id].map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
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
          {approvedIds && (
            <p className="mt-3 text-sm text-gray-600">
              Some items couldn&apos;t be approved (highlighted above). You can pay for the approved
              items only.
            </p>
          )}
          {payError && <p className="mt-3 text-sm text-red-500">{payError}</p>}
          <button
            onClick={handlePay}
            disabled={paying}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 py-3 font-semibold text-white disabled:opacity-60 md:w-80"
          >
            {paying
              ? 'Processing…'
              : approvedIds
                ? `Pay for approved only (R${approvedTotal.toFixed(2)})`
                : `Pay now (R${payNow.toFixed(2)})`}
          </button>
        </aside>
      </div>
    </>
  )
}

export default OrderSummaryPage
