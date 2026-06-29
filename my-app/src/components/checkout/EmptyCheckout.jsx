import { useNavigate } from 'react-router-dom'
import TopNav from '../home/TopNav'
import CheckoutHeader from './CheckoutHeader'
import emptyCart from '../../assets/empty-cart.png'

// Guard shown when a checkout step is reached with an empty cart (e.g. after the
// cart is cleared, or via a stale/direct URL).
function EmptyCheckout() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-svh flex-col">
      <TopNav />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
        <CheckoutHeader title="Checkout" onBack={() => navigate('/cart')} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <img src={emptyCart} alt="" className="w-60" />
          <p className="mt-4 text-lg font-bold">Your cart is empty</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mb-10 w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 py-3 font-semibold text-white"
        >
          Continue browsing
        </button>
      </div>
    </div>
  )
}

export default EmptyCheckout
