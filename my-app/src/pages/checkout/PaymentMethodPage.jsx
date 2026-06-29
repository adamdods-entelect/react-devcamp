import { useNavigate } from 'react-router-dom'
import { CreditCard, ChevronRight } from 'lucide-react'
import useCart from '../../hooks/useCart'
import usePaymentMethods from '../../hooks/usePaymentMethods'
import { selectCard } from '../../services/paymentMethods'
import TopNav from '../../components/home/TopNav'
import CheckoutHeader from '../../components/checkout/CheckoutHeader'
import EmptyCheckout from '../../components/checkout/EmptyCheckout'

// Step 1 of checkout (wireframe 5): pick a saved card or add a new one, then
// continue to the order summary.
function PaymentMethodPage() {
  const navigate = useNavigate()
  const items = useCart()
  const { cards, selectedId } = usePaymentMethods()

  if (items.length === 0) return <EmptyCheckout />

  return (
    <>
      <TopNav />
      <div className="mx-auto flex min-h-svh max-w-md flex-col px-6 pb-10">
        <CheckoutHeader title="Select a payment method" />

        {cards.length > 0 && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-bold">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment method
            </h2>
            <ul className="mt-4">
              {cards.map((card) => (
                <li key={card.id}>
                  <label className="flex cursor-pointer items-center gap-3 py-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="h-5 w-5 accent-blue-600"
                      checked={card.id === selectedId}
                      onChange={() => selectCard(card.id)}
                    />
                    <span className="flex-1">
                      <span className="block font-medium">{card.brand}</span>
                      <span className="block text-sm text-gray-400">•••• {card.last4}</span>
                    </span>
                    <span className="text-sm font-bold text-blue-700">{card.brand}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6 border-t border-gray-100 pt-6">
          <h2 className="font-bold">Add payment method</h2>
          <button
            type="button"
            onClick={() => navigate('/checkout/add-card')}
            className="mt-4 flex w-full items-center justify-between rounded-2xl bg-gray-100 px-5 py-4 text-left"
          >
            <span>
              <span className="block font-bold">Credit card</span>
              <span className="mt-1 block text-sm text-gray-500">Visa · Mastercard · Amex</span>
            </span>
            <ChevronRight className="h-6 w-6 text-blue-600" />
          </button>
        </section>

        <button
          type="button"
          disabled={!selectedId}
          onClick={() => navigate('/checkout/summary')}
          className={`mt-auto w-full rounded-full py-3 font-semibold transition-colors ${
            selectedId
              ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          Next
        </button>
      </div>
    </>
  )
}

export default PaymentMethodPage
