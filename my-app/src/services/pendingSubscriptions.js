// Client-side record of products that were taken up but whose fulfilment checks
// (e.g. KYC) haven't passed yet. The backend only persists *active* (fully
// verified) subscriptions, so without this a pending order would vanish from the
// UI until the checks complete. Keyed per user (Firebase uid) like the saved
// payment methods; falls back to a device key when there's no Firebase session.
import { auth } from './firebase'

const ownerId = () => auth.currentUser?.uid ?? 'me'
const keyFor = (uid) => `subscriptions.pending.${uid}`

function read(uid) {
  try {
    const raw = localStorage.getItem(keyFor(uid))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(uid, list) {
  localStorage.setItem(keyFor(uid), JSON.stringify(list))
}

export function getPending() {
  return read(ownerId())
}

// Record products as pending (deduped by product id).
export function addPending(products) {
  const uid = ownerId()
  const byId = new Map(read(uid).map((p) => [p.id, p]))
  for (const p of products) {
    byId.set(p.id, { id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl })
  }
  write(uid, [...byId.values()])
}

export function removePending(productId) {
  const uid = ownerId()
  write(uid, read(uid).filter((p) => p.id !== productId))
}
