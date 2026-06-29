import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// Mobile back-arrow header shared by the checkout steps. `title` is allowed to
// truncate (matching the wireframes' "Select a payment…" etc.).
function CheckoutHeader({ title, onBack }) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-3 pt-6 md:hidden">
      <button onClick={onBack ?? (() => navigate(-1))} aria-label="Back">
        <ArrowLeft className="h-6 w-6" />
      </button>
      <h1 className="truncate text-xl font-bold">{title}</h1>
    </header>
  )
}

export default CheckoutHeader
