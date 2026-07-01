import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo-login.png'
import useAuth from '../hooks/useAuth'
import { signInWithGoogle } from '../services/googleAuth'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // Where to go after auth: the deep link the user was blocked from, else home.
  const from = location.state?.from ?? '/'
  const { login, loginAsGuest } = useAuth()
  const [authError, setAuthError] = useState('')

  const handleGuest = () => {
    loginAsGuest()
    navigate(from)
  }

  const handleGoogle = async () => {
    setAuthError('')
    try {
      const res = await signInWithGoogle()
      if (res.kind === 'existing') {
        login(res.token) // returning user: backend JWT + Firebase session both active
        navigate(from)
      } else if (res.kind === 'exists') {
        // email was registered with a password -> Google can't log into it
        navigate('/login/signin', {
          state: { notice: 'You already registered this email with a password. Please log in below.' },
        })
      } else {
        // new Google user: collect the ID number in the profile step, then provision the backend
        navigate('/register', {
          state: {
            google: {
              email: res.email,
              password: res.password,
              firstName: res.firstName,
              lastName: res.lastName,
            },
          },
        })
      }
    } catch (err) {
      // user dismissed the popup -- not an error worth showing
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return
      setAuthError('Could not sign in with Google. Please try again.')
    }
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
      <div className="mx-auto w-full max-w-sm space-y-5 pb-12">
        <Link
          to="/login/signin"
          state={{ from }}
          className="block w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 py-3 text-center font-semibold text-white"
        >
          Login
        </Link>

        <button
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-white py-3 text-center font-semibold text-gray-700"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {authError && <p className="text-center text-sm text-red-400">{authError}</p>}

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

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C39 36.3 44 31 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export default LoginPage