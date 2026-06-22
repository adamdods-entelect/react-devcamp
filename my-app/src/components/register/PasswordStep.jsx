import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Check, X, Eye, EyeOff, Loader2 } from 'lucide-react'

import { pwnedCount } from '../../services/pwnedPasswords'

// The 5 rules from the wireframe: each is a label + a test against the value.
const RULES = [
  { label: 'one lowercase character', test: (v) => /[a-z]/.test(v) },
  { label: 'one uppercase character', test: (v) => /[A-Z]/.test(v) },
  { label: 'one number/digit', test: (v) => /\d/.test(v) },
  { label: 'one special symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
  { label: '8 characters', test: (v) => v.length >= 8 },
]

// Screens 20–22. Collects password; gates Next on all 5 rules passing.
function PasswordStep({ onNext, defaultPassword = '' }) {
  const [show, setShow] = useState(false)
  const { register, handleSubmit, watch } = useForm({
    mode: 'onChange',
    defaultValues: { password: defaultPassword },
  })

  const password = watch('password') ?? ''
  const results = RULES.map((r) => ({ ...r, passed: r.test(password) }))
  const passedCount = results.filter((r) => r.passed).length
  const allPassed = passedCount === RULES.length

  // breach check (HaveIBeenPwned). null = unknown/not-checked/failed-open, number = breach count.
  const [breached, setBreached] = useState(null)
  const [checking, setChecking] = useState(false)

  // Only hit the network once the cheap local rules pass, and debounce so we're
  // not firing a request on every keystroke. Fail open: a network error never
  // blocks registration, it just leaves the breach status unknown.
  useEffect(() => {
    if (!allPassed) {
      setBreached(null)
      setChecking(false)
      return
    }
    let cancelled = false
    setChecking(true)
    const timer = setTimeout(async () => {
      try {
        const count = await pwnedCount(password)
        if (!cancelled) setBreached(count)
      } catch {
        if (!cancelled) setBreached(null) // fail open
      } finally {
        if (!cancelled) setChecking(false)
      }
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [password, allPassed])

  const breachBlocked = breached > 0
  const canSubmit = allPassed && !breachBlocked && !checking

  // meter colour by strength
  const meterColor =
    passedCount <= 2 ? 'bg-red-500' : passedCount <= 4 ? 'bg-amber-400' : 'bg-green-500'

  const submit = ({ password }) => onNext({ password })

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-6 py-10">
      <h1 className="mt-12 text-center text-2xl font-bold">Welcome to InsureTechGuard</h1>
      <p className="mt-2 text-center text-gray-500">Create a password</p>

      <form onSubmit={handleSubmit(submit)} className="mt-8 flex flex-1 flex-col" noValidate>
        {/* password with floating label + show/hide */}
        <div className="relative">
          <label htmlFor="password" className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
            Password
          </label>
          <input
            id="password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            className="w-full rounded-md border border-gray-300 px-3 py-3 pr-11 text-gray-900 outline-none focus:border-cyan-500"
            {...register('password', { validate: () => allPassed })}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* strength meter — one segment per rule, filled up to passedCount */}
        <div className="mt-3 flex gap-2">
          {RULES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < passedCount ? meterColor : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {/* checklist */}
        <p className="mt-5 text-gray-700">Password must contain at least:</p>
        <ul className="mt-2 space-y-1">
          {results.map((r) => (
            <li key={r.label} className="flex items-center gap-2 text-sm text-gray-600">
              <RuleIcon state={password.length === 0 ? 'idle' : r.passed ? 'pass' : 'fail'} />
              {r.label}
            </li>
          ))}

          {/* breach check — only meaningful once the local rules pass */}
          <li className="flex items-center gap-2 text-sm text-gray-600">
            {checking ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" />
            ) : (
              <RuleIcon
                state={!allPassed ? 'idle' : breached === 0 ? 'pass' : breachBlocked ? 'fail' : 'idle'}
              />
            )}
            {breachBlocked
              ? 'this password has appeared in a data breach'
              : 'not found in a known data breach'}
          </li>
        </ul>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`mt-6 w-full rounded-full py-3 font-semibold transition-colors ${
            canSubmit
              ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          Next
        </button>
      </form>
    </div>
  )
}

function RuleIcon({ state }) {
  if (state === 'pass') return <Check className="h-4 w-4 shrink-0 text-green-600" />
  if (state === 'fail') return <X className="h-4 w-4 shrink-0 text-red-500" />
  return <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
}

export default PasswordStep
