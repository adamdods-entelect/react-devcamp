import { useEffect, useRef, useState } from 'react'
import { sendRegistrationOtp, verifyRegistrationOtp } from '../../services/otp'

const LENGTH = 6
const COOLDOWN = 60 // seconds the server enforces between sends; mirror it in the UI

function VerifyCodeStep({ email, onNext, onBack }) {
  const [digits, setDigits] = useState(Array(LENGTH).fill(''))
  const [verifying, setVerifying] = useState(false)
  const [sending, setSending] = useState(true)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const inputs = useRef([])
  const sentRef = useRef(false)

  // Ask the server to email a code when this step opens. The ref guard stops
  // React StrictMode's double-invoke from sending (and overwriting) two codes.
  useEffect(() => {
    if (sentRef.current) return
    sentRef.current = true
    sendRegistrationOtp(email).then((res) => {
      if (res.ok) setCooldown(COOLDOWN)
      else setError('Could not send a code. Check your connection and try again.')
      setSending(false)
    })
  }, [email])

  // Tick the resend cooldown down to zero.
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const verify = async (code) => {
    setVerifying(true)
    setError('')
    const res = await verifyRegistrationOtp(email, code)
    if (res.ok) {
      onNext()
      return
    }
    // generic message — never reveals whether the account already exists
    setError('Incorrect or expired code. If you already have an account, check your email to log in.')
    setDigits(Array(LENGTH).fill(''))
    setVerifying(false)
    inputs.current[0]?.focus()
  }

  const setDigit = (i, value) => {
    const char = value.replace(/\D/g, '').slice(-1) // keep one digit only
    const nextDigits = [...digits]
    nextDigits[i] = char
    setDigits(nextDigits)

    if (char && i < LENGTH - 1) inputs.current[i + 1]?.focus() // auto-advance
    if (nextDigits.every((d) => d !== '')) verify(nextDigits.join('')) // all filled
  }

  const handleKeyDown = (i, e) => {
    // backspace on an empty box hops to the previous one
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    if (!text) return
    e.preventDefault()
    const nextDigits = Array(LENGTH).fill('')
    text.split('').forEach((c, idx) => (nextDigits[idx] = c))
    setDigits(nextDigits)
    inputs.current[Math.min(text.length, LENGTH - 1)]?.focus()
    if (text.length === LENGTH) verify(nextDigits.join(''))
  }

  const resend = async () => {
    setDigits(Array(LENGTH).fill(''))
    setError('')
    setSending(true)
    const res = await sendRegistrationOtp(email)
    if (res.ok) setCooldown(COOLDOWN)
    else setError('Could not send a code. Check your connection and try again.')
    setSending(false)
    inputs.current[0]?.focus()
  }

  if (verifying) {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col items-center px-6 py-10">
        <h1 className="mt-8 text-2xl font-bold">Enter verification code</h1>
        <div className="mt-24 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-6 py-10">
      <h1 className="mt-8 text-center text-2xl font-bold">Enter verification code</h1>
      <p className="mt-4 text-center text-gray-600">
        {sending ? 'Sending a code to' : 'We sent a code to'}{' '}
        <span className="font-medium text-cyan-500">{email}</span>
      </p>
      <button onClick={onBack} className="mx-auto mt-1 text-sm text-gray-800 underline">
        Not you?
      </button>

      <div className="mt-8 flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
            maxLength={1}
            autoFocus={i === 0}
            disabled={sending}
            className="h-14 w-12 rounded-lg bg-gray-100 text-center text-xl font-semibold outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />
        ))}
      </div>

      {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

      <p className="mt-6 text-center text-sm text-gray-600">
        Haven&apos;t received your code?{' '}
        <button
          type="button"
          onClick={resend}
          disabled={sending || cooldown > 0}
          className="font-semibold text-cyan-500 disabled:opacity-50"
        >
          {cooldown > 0 ? `Send again in ${cooldown}s` : 'Send again'}
        </button>
      </p>
    </div>
  )
}

export default VerifyCodeStep
