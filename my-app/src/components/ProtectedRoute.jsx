import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ children, allowGuest = true }) {
    const { status } = useAuth()

    if (status === 'unauthenticated') {
        return <Navigate to="/login" replace />
    }
    // Guests can browse, but routes that need a real account (e.g. account,
    // subscriptions) aren't reachable. The nav intercepts guest clicks and shows
    // the sign-up sheet in-place; a guest landing here via direct URL goes home.
    if (!allowGuest && status === 'guest') {
        return <Navigate to="/" replace />
    }
    return children
}
