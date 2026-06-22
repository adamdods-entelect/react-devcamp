import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import useSubscriptions from '../../hooks/useSubscriptions'
import { addSubscription } from '../../services/subscriptions'
import CreateAccountSheet from './CreateAccountSheet'

function PriceBar({ product }) {
    const { status } = useAuth()
    const navigate = useNavigate()
    const subscriptions = useSubscriptions()
    const [showSheet, setShowSheet] = useState(false)

    const subscribed = subscriptions.some((s) => s.id === product.id)

    const handleClick = () => {
        if (status === 'guest') {
            setShowSheet(true) // guests must create an account first
            return
        }
        if (subscribed) {
            navigate('/subscriptions')
            return
        }
        addSubscription(product)
    }

    return (
        <>
            <footer className="fixed bottom-0 left-1/2 flex w-full max-w-5xl -translate-x-1/2 items-center justify-between border-t border-[#e5e4e7] bg-white px-4 py-3">
                <div className="flex flex-col">
                    <span className="text-lg font-bold">R {product.price.toFixed(2)}</span>
                    <span className="text-[13px] text-[#6b6375]">per month</span>
                </div>
                <button
                    type="button"
                    onClick={handleClick}
                    className="rounded-3xl bg-gradient-to-r from-[#2f6bff] to-[#00c2ff] px-7 py-3 font-semibold text-white"
                >
                    {subscribed ? 'Subscribed — View' : 'Add to cart'}
                </button>
            </footer>
            <CreateAccountSheet open={showSheet} onClose={() => setShowSheet(false)} />
        </>
    )
}

export default PriceBar
