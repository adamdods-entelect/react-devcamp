import { NavLink } from 'react-router-dom'
import { Home, Layers, ShoppingCart, User } from 'lucide-react'
import logo from '../../assets/logo-login.png'

const items = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/subscriptions', label: 'Subscriptions', Icon: Layers },
  { to: '/cart', label: 'Cart', Icon: ShoppingCart },
  { to: '/account', label: 'Account', Icon: User },
]

function TopNav() {
  return (
    <header className="hidden border-b border-gray-200 bg-white md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 text-lg font-bold">
          <img src={logo} alt="" className="h-8 w-8 object-contain" />
          InsureTechGuard
        </span>
        <nav className="flex gap-6">
          {items.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default TopNav