import { useState } from 'react'
import useAuth from '../hooks/useAuth'
import CreateAccountSheet from './CreateAccountSheet'

function PriceBar({ price }) {
    const { status } = useAuth()
    const [showSheet, setShowSheet] = useState(false)

    const handleAddToCart = () => {
        if (status === 'guest') {
            setShowSheet(true)
            return
        }
    }

    return (
        <footer className="fixed bottom-0 left-1/2 flex w-full max-w-[420px] -translate-x-1/2 items-center justify-between border-t border-[#e5e4e7] bg-white px-4 py-3">
            <div className="flex flex-col">
                <span className="text-lg font-bold">R {price.toFixed(2)}</span>
                <span className="text-[13px] text-[#6b6375]">per month</span>
            </div>
            <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-3xl bg-gradient-to-r from-[#2f6bff] to-[#00c2ff] px-7 py-3 font-semibold text-white"
            >
                Add to cart
            </button>
            <CreateAccountSheet open={showSheet} onClose={() => setShowSheet(false)} />
        </footer>
    )
}

export default PriceBar
