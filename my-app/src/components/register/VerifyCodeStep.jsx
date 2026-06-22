import { useRef, useState } from 'react'

const LENGTH = 6

function VerifyCodeStep({ email, onNext, onBack }) {
     const [digits, setDigits] = useState(Array(LENGTH).fill(''))
  const [verifying, setVerifying] = useState(false)
  const inputs = useRef([])

  const verify = () => {
    setVerifying(true)
    setTimeout(() => onNext(), 1200) // pretend to check the code with a server
  }

  const setDigit = (i, value) => {
    const char = value.replace(/\D/g, '').slice(-1) // keep one digit only
    const nextDigits = [...digits]
    nextDigits[i] = char
    setDigits(nextDigits)

    if (char && i < LENGTH - 1) inputs.current[i + 1]?.focus() // auto-advance
    if (nextDigits.every((d) => d !== '')) verify()             // all filled
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
    if (text.length === LENGTH) verify()
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
        We have a temporary login code to{' '}
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
            className="h-14 w-12 rounded-lg bg-gray-100 text-center text-xl font-semibold outline-none focus:ring-2 focus:ring-cyan-500"
          />
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Haven&apos;t received your code?{' '}
        <button
          type="button"
          onClick={() => setDigits(Array(LENGTH).fill(''))}
          className="font-semibold text-cyan-500"
        >
          Send again
        </button>
      </p>
    </div>
  )
}

export default VerifyCodeStep
