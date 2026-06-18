import { X } from 'lucide-react'

function PrepSheet({ title, tips, continueLabel = 'Got it', onContinue, onClose }) {
    return (
        <div className="absolute inset-0 z-10 flex items-end sm:items-center sm:justify-center">
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative w-full rounded-t-3xl bg-white px-6 pb-8 pt-4 sm:max-w-md sm:rounded-3xl">
                <button onClick={onClose} className="mb-2" aria-label="Close">
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-center text-xl font-bold">{title}</h2>

                <div className="mt-6 space-y-4">
                    {tips.map((tip) => (
                        <div key={tip.title}>
                            <p className="font-bold">{tip.title}</p>
                            <p className="mt-1 text-gray-500">{tip.body}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onContinue}
                    className="mt-8 w-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-400 py-3 font-semibold text-white"
                >
                    {continueLabel}
                </button>
            </div>
        </div>
    )
}

export default PrepSheet
