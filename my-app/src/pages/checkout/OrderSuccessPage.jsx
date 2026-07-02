import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import TopNav from '../../components/home/TopNav'
import CheckoutHeader from '../../components/checkout/CheckoutHeader'

// Final checkout screen (wireframe 7): order confirmation. The wireframe reuses
// the "Pay now" button here, but payment is already done — so this returns home.
function OrderSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // This screen is only reached on a full pass (a decline stays on the summary),
  // so the take-up succeeded and a contract was generated (US8).
  const contractUrl = location.state?.contractUrl

  return (
    <div className="flex min-h-svh flex-col">
      <TopNav />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
        <CheckoutHeader title="Order summary" onBack={() => navigate('/')} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <CheckCircle2 className="h-20 w-20 text-green-500" strokeWidth={1.5} />
          <p className="mt-4 text-xl font-bold">Thank you for your order.</p>
          {contractUrl && (
            <a
              href={contractUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full rounded-full border border-blue-600 py-3 text-center font-semibold text-blue-600"
            >
              View your contract
            </a>
          )}
          <button
            onClick={() => navigate('/')}
            className="mt-8 w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 py-3 font-semibold text-white"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
