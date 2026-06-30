import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Layers, ShoppingCart, User } from 'lucide-react'
import logo from '../../assets/logo-login.png'
import useAuth from '../../hooks/useAuth'
import CreateAccountSheet from '../product/CreateAccountSheet'

const items = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/subscriptions', label: 'Subscriptions', Icon: Layers, requiresAuth: true },
  { to: '/cart', label: 'Cart', Icon: ShoppingCart },
  { to: '/account', label: 'Account', Icon: User, requiresAuth: true },
]

function TopNav() {
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
    <header className="hidden border-b border-gray-200 bg-white md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
        <span className="flex items-center gap-3 text-2xl font-bold">
          <img src={logo} alt="" className="h-11 w-11 object-contain" />
          InsureTechGuard
        </span>
        <nav className="flex gap-8">
          {items.map(({ to, label, Icon, requiresAuth }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={(e) => handleClick(e, requiresAuth)}
              className={({ isActive }) =>
                `flex items-center gap-2 text-base ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`
              }
            >
              <Icon size={22} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <CreateAccountSheet open={showSheet} onClose={() => setShowSheet(false)} />
    </header>
  )
}

export default TopNav
