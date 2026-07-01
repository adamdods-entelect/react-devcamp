import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ children, allowGuest = true }) {
    const { status } = useAuth()
    const location = useLocation()

    if (status === 'unauthenticated') {
        // Remember where they were headed so login can send them back (deep links).
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    }
    // Guests can browse, but routes that need a real account (e.g. account,
    // subscriptions) aren't reachable. The nav intercepts guest clicks and shows
    // the sign-up sheet in-place; a guest landing here via direct URL goes home.
    if (!allowGuest && status === 'guest') {
        return <Navigate to="/" replace />
    }
    return children
}
