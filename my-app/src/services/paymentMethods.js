// Saved payment methods, persisted per user in localStorage.
//
// IMPORTANT: we only ever store display-safe fields (brand, last 4, holder,
// expiry) — never the full card number or CVC. There is no payment backend (the
// BRS services expose no cart/payment endpoint), so this is a client-side mock
// that just lets the checkout flow remember a card between steps and reloads.
//
// Keyed by Firebase uid (like the cart). Checkout is logged-in only; if there is
// no Firebase session we fall back to a single 'me' key on this device.
import { auth } from './firebase'
import { cardBrand, cardLast4 } from '../utils/card'

const ownerId = () => auth.currentUser?.uid ?? 'me'
const keyFor = (uid) => `payment.${uid}`
const EMPTY = { cards: [], selectedId: null }

function read(uid) {
  try {
    const raw = localStorage.getItem(keyFor(uid))
    return raw ? JSON.parse(raw) : { ...EMPTY }
  } catch {
    return { ...EMPTY }
  }
}

function write(uid, state) {
  localStorage.setItem(keyFor(uid), JSON.stringify(state))
  window.dispatchEvent(new Event('payment-changed'))
}

export function getState() {
  return read(ownerId())
}

export function selectCard(id) {
  const uid = ownerId()
  write(uid, { ...read(uid), selectedId: id })
}

export function addCard({ number, holderName, expiry }) {
  const uid = ownerId()
  const state = read(uid)
  const card = {
    id: crypto.randomUUID(),
    brand: cardBrand(number),
    last4: cardLast4(number),
    holderName,
    expiry,
  }
  write(uid, { cards: [...state.cards, card], selectedId: card.id })
  return card
}

export function subscribe(cb) {
  const uid = ownerId()
  const refresh = () => cb(read(uid))
  window.addEventListener('payment-changed', refresh)
  window.addEventListener('storage', refresh)
  refresh()
  return () => {
    window.removeEventListener('payment-changed', refresh)
    window.removeEventListener('storage', refresh)
  }
}
