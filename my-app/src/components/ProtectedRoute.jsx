import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import HomePage from '../pages/HomePage'
import CreateAccountSheet from './product/CreateAccountSheet'

// Shows the home page with the sign-up sheet floating over it (like ProductPage);
// dismissing the sheet drops the guest back on the home page.
function GuestPrompt() {
    const [open, setOpen] = useState(true)
    const navigate = useNavigate()
    return (
        <>
            <HomePage />
            <CreateAccountSheet open={open} onClose={() => { setOpen(false); navigate('/') }} />
        </>
    )
}

export default function ProtectedRoute({ children, allowGuest = true }) {
    const { status } = useAuth()

    if (status === 'unauthenticated') {
        return <Navigate to="/login" replace />
    }
    // Guests can browse, but routes that need a real account (e.g. account,
    // subscriptions) prompt them to sign up / log in over the home page.
    if (!allowGuest && status === 'guest') {
        return <GuestPrompt />
    }
    return children
}