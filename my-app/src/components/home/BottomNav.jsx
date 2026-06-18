import { NavLink } from 'react-router-dom'
import { Home, Layers, ShoppingCart, User } from 'lucide-react'

const items = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/subscriptions', label: 'Subscriptions', Icon: Layers },
  { to: '/cart', label: 'Cart', Icon: ShoppingCart },
  { to: '/account', label: 'Account', Icon: User },
]

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-[420px] justify-around border-t border-gray-200 bg-white py-2">
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
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
  )
}

export default BottomNav
