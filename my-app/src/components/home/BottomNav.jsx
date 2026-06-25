import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Layers, ShoppingCart, User } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import CreateAccountSheet from '../product/CreateAccountSheet'

const items = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/subscriptions', label: 'Subscriptions', Icon: Layers, requiresAuth: true },
  { to: '/cart', label: 'Cart', Icon: ShoppingCart },
  { to: '/account', label: 'Account', Icon: User, requiresAuth: true },
]

function BottomNav() {
  const { status } = useAuth()
  const [showSheet, setShowSheet] = useState(false)

  // Guests can't enter account/subscriptions — pop the sign-up sheet over the
  // current page instead of navigating away.
  const handleClick = (e, requiresAuth) => {
    if (requiresAuth && status === 'guest') {
      e.preventDefault()
      setShowSheet(true)
    }
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-[420px] justify-around border-t border-gray-200 bg-white py-2 md:hidden">
        {items.map(({ to, label, Icon, requiresAuth }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={(e) => handleClick(e, requiresAuth)}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
      <CreateAccountSheet open={showSheet} onClose={() => setShowSheet(false)} />
    </>
  )
}

export default BottomNav
