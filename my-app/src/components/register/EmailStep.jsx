import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function EmailStep({ onNext, onGoogle, defaultEmail = '' }) {
    const {
        register,
        handleSubmit,
        formState: { isValid },
    } = useForm({ mode: 'onChange', defaultValues: { email: defaultEmail } })

    const submit = ({ email }) => onNext({ email })

    return (
    <main className="flex min-h-svh flex-col bg-[#1a2238]">
      {/* dark top strip */}
      <div className="h-24 shrink-0" />

      {/* white sheet */}
      <div className="flex flex-1 flex-col rounded-t-3xl bg-white px-6 pb-8 pt-3">
        {/* drag handle */}
        <div className="mx-auto h-1.5 w-10 rounded-full bg-gray-300" />

        <h1 className="mt-10 text-center text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mx-auto mt-3 max-w-xs text-center text-gray-500">
          Create a profile, browse and subscribe to our range of products.
        </p>

        {/* Continue with Google — provisions/links the backend account via the derived password */}
        <button
          type="button"
          onClick={onGoogle}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 py-3 font-medium text-gray-700"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* "or" divider */}
        <div className="my-5 flex items-center gap-3 text-sm text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          or
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col" noValidate>
          {/* email with floating label */}
          <div className="relative">
            <label htmlFor="email" className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter email address"
              className="w-full rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-cyan-500"
              {...register('email', { required: true, pattern: EMAIL_PATTERN })}
            />
          </div>

          {/* grey until a valid email is entered, then gradient */}
          <button
            type="submit"
            disabled={!isValid}
            className={`mt-5 w-full rounded-full py-3 font-semibold transition-colors ${
              isValid
                ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            Next
          </button>

          <p className="mt-5 text-center text-sm text-gray-700">
            Already have an account?{' '}
            <Link to="/login/signin" className="font-semibold text-cyan-500">
              Log in
            </Link>
          </p>

          <p className="mx-auto mt-auto max-w-xs pt-8 text-center text-xs text-gray-400">
            By continuing, you agree to our{' '}
            <span className="font-semibold text-gray-500">Terms of Service</span> and acknowledge that you
            have read our <span className="font-semibold text-gray-500">Privacy Policy</span> to learn how we
            collect, use, and share your data.
          </p>
        </form>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

export default EmailStep