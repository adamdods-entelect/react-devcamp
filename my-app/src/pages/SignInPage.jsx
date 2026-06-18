import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo-login.png'
import useAuth from '../hooks/useAuth'
import { requestToken } from '../services/authService'

function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm({ mode: 'onChange' })
  const navigate = useNavigate()
  const { login } = useAuth()
  const [authError, setAuthError] = useState('')

  const onSubmit = async ({ email, password }) => {
    setAuthError('')
    try {
      const result = await requestToken(email, password)

      if (!result.ok) {
        if (result.reason === 'invalid') {
          setAuthError('Incorrect email or password.')
        } else if (result.reason === 'server') {
          setAuthError('Something went wrong. Please try again later.')
        } else {
          setAuthError(result.message || 'Login failed. Please try again.')
        }
        return
      }

      login(result.token)
      navigate('/')
    } catch {
      setAuthError('Could not reach the server. Please try again.')
    }
  }

  return (
    <main className="flex min-h-svh flex-col bg-[#1a2238] px-6 text-white">
      {/* logo + wordmark */}
      <div className="mt-16 flex flex-col items-center">
        <img src={logo} alt="" className="mb-3 h-16 w-auto object-contain" />
        <p className="text-2xl tracking-wide">
          InsureTech<span className="font-bold">Guard</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto mt-12 w-full max-w-sm space-y-4" noValidate>
        {/* email */}
        <div className="relative">
          <label
            htmlFor="email"
            className="absolute -top-2 left-3 bg-[#1a2238] px-1 text-xs text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-gray-500 bg-transparent px-3 py-3 text-white outline-none focus:border-blue-400"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
          />
        </div>

        {/* password */}
        <div className="relative">
          <label
            htmlFor="password"
            className="absolute -top-2 left-3 bg-[#1a2238] px-1 text-xs text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-md border border-gray-500 bg-transparent px-3 py-3 pr-11 text-white placeholder-gray-500 outline-none focus:border-blue-400"
            {...register('password', { required: 'Password is required' })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </div>

        {/* login button: grey until valid, gradient when valid */}
        {authError && <p className="text-sm text-red-400">{authError}</p>}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`w-full rounded-full py-3 font-semibold transition-colors ${
            isValid
              ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white'
              : 'bg-gray-300 text-gray-500'
          }`}
        >
          Login
        </button>

        <Link to="/forgot-password" className="block text-center text-sm text-cyan-400">
          Forgot password?
        </Link>
      </form>

      {/* bottom: sign up */}
      <p className="mt-auto pb-8 text-center text-sm text-gray-300">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-cyan-400 underline">
          Sign up
        </Link>
      </p>
    </main>
  )
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default SignInPage
