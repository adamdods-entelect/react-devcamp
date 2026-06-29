// Helpers for the (mock) checkout card form. There is no payment backend — the
// BRS services expose no cart/payment endpoint — so card entry is validated and
// stored client-side only, and we never persist the full number or CVC.

const digits = (value) => (value || '').replace(/\D/g, '')

// Identify the card brand from its leading digits (enough for display).
export function cardBrand(number) {
  const n = digits(number)
  if (/^4/.test(n)) return 'Visa'
  if (/^3[47]/.test(n)) return 'American Express'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard'
  return 'Card'
}

// Last 4 digits, for the masked display (e.g. "•••• 893").
export function cardLast4(number) {
  return digits(number).slice(-4)
}

// Luhn check + length, the same validation a real card field would do.
export function isValidCardNumber(number) {
  const n = digits(number)
  if (n.length < 13 || n.length > 19) return false
  let sum = 0
  let alternate = false
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i])
    if (alternate) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    alternate = !alternate
  }
  return sum % 10 === 0
}

// MM/YY, a real month, and not already expired.
export function isValidExpiry(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec((value || '').trim())
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  const now = new Date()
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)
  return endOfMonth >= now
}

export function isValidCvc(value) {
  return /^\d{3,4}$/.test((value || '').trim())
}
