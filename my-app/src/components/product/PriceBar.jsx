import { useNavigate } from 'react-router-dom'
import useCart from '../../hooks/useCart'
import useAuth from '../../hooks/useAuth'
import useEligibility from '../../hooks/useEligibility'
import { addToCart } from '../../services/cart'

function PriceBar({ product }) {
    const navigate = useNavigate()
    const cart = useCart()
    const { status } = useAuth()
    // Only logged-in customers can be checked (guests have no profile).
    const { loading, eligible, reasons } = useEligibility(product.id, status === 'authenticated')

    const inCart = cart.some((i) => i.id === product.id)
    // Already-in-cart items stay actionable (View); otherwise block ineligible ones.
    const blocked = !inCart && !eligible

    const handleClick = () => {
        if (inCart) {
            navigate('/cart')
            return
        }
        if (!eligible) return
        addToCart(product)
    }

    return (
        <footer className="fixed bottom-0 left-1/2 flex w-full max-w-5xl -translate-x-1/2 items-center justify-between border-t border-[#e5e4e7] bg-white px-4 py-3">
            <div className="flex flex-col">
                <span className="text-lg font-bold">R {product.price.toFixed(2)}</span>
                {blocked ? (
                    <span className="text-[13px] text-red-500">
                        {reasons[0] ?? 'Not available for your account'}
                    </span>
                ) : (
                    <span className="text-[13px] text-[#6b6375]">per month</span>
                )}
            </div>
            <button
                type="button"
                onClick={handleClick}
                disabled={blocked || loading}
                className={`rounded-3xl px-7 py-3 font-semibold ${
                    blocked
                        ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                        : 'bg-gradient-to-r from-[#2f6bff] to-[#00c2ff] text-white'
                }`}
            >
                {inCart ? 'In cart — View' : blocked ? 'Not eligible' : 'Add to cart'}
            </button>
        </footer>
    )
}

export default PriceBar
