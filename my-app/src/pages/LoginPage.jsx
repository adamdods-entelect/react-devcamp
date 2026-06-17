import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo-login.png'
import useAuth from '../hooks/useAuth'

function LoginPage() {
  const navigate = useNavigate()
  const { loginAsGuest } = useAuth()

  const handleGuest = () => {
    loginAsGuest()
    navigate('/')
  }

  return (
    <main className="flex min-h-svh flex-col bg-[#1a2238] px-6 text-white">
      {/* logo + wordmark, centered in the upper area */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <img src={logo} alt="" className="mb-4 h-16 w-16 object-contain" />
        <p className="text-2xl tracking-wide">
         InsureTech<span className="font-bold">Guard</span>
        </p>
      </div>

      {/* actions pinned toward the bottom */}
      <div className="space-y-5 pb-12">
        <Link
          to="/login/signin"
          className="block w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 py-3 text-center font-semibold text-white"
        >
          Login
        </Link>

        <p className="text-center text-sm text-gray-300">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-cyan-400 underline">
            Sign up
          </Link>
        </p>

        <button onClick={handleGuest} className="block w-full text-center text-sm text-gray-200">
          Continue as guest
        </button>
      </div>
    </main>
  )
}

export default LoginPage