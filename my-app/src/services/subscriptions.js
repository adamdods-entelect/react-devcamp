// Local, device-scoped store of the products a user has subscribed to.
// Persisted in localStorage so subscriptions survive reloads (Milestone 6).
// Writes dispatch a 'subscriptions-changed' event so any mounted hook re-reads.
const KEY = 'subscriptions'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
  window.dispatchEvent(new Event('subscriptions-changed'))
}

export function getSubscriptions() {
  return read()
}

export function isSubscribed(id) {
  return read().some((s) => s.id === id)
}

export function addSubscription(product) {
  const list = read()
  if (list.some((s) => s.id === product.id)) return list
  const next = [
    ...list,
    {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      subscribedAt: new Date().toISOString(),
    },
  ]
  write(next)
  return next
}

export function removeSubscription(id) {
  const next = read().filter((s) => s.id !== id)
  write(next)
  return next
}
