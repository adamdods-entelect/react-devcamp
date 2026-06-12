import { useNavigate } from 'react-router-dom'

function CreateAccountSheet({ open, onClose }) {
    const navigate = useNavigate()
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full rounded-t-3xl bg-white px-6 pb-8 pt-3">
                <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-gray-300" />
                <h2 className="text-center text-xl font-bold">Create your account</h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Create a profile, browse and subscribe to our range of products.
                </p>
                <button
                    onClick={() => navigate('/register')}
                    className="mt-6 w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 py-3 font-semibold text-white"
                >
                    Join with email
                </button>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login/signin')} className="font-semibold text-blue-600">
                        Log in
                    </button>
                </p>
            </div>
        </div>
    )
}

export default CreateAccountSheet