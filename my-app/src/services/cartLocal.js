// localStorage-backed shopping cart (Milestone 6 data persistence).
// Items are keyed by product id + billing type, so the same product can appear
// as both a "monthly" and a "once" line. Writes dispatch 'cart-changed' so any
// mounted useCart re-reads.
const KEY = 'cart.guest'

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
  window.dispatchEvent(new Event('cart-changed'))
}

const sameLine = (i, id, billing) => i.id === id && i.billing === billing

export function getLocalCart() {
  return read()
}

export function addLocal(product, billing = 'monthly') {
  const list = read()
  const existing = list.find((i) => sameLine(i, product.id, billing))
  const next = existing
    ? list.map((i) => (sameLine(i, product.id, billing) ? { ...i, qty: i.qty + 1 } : i))
    : [
        ...list,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          billing, // 'monthly' | 'once'
          qty: 1,
        },
      ]
  write(next)
  return next
}

export function setQtyLocal(id, billing, qty) {
  if (qty <= 0) return removeLocal(id, billing)
  const next = read().map((i) => (sameLine(i, id, billing) ? { ...i, qty } : i))
  write(next)
  return next
}

export function removeLocal(id, billing) {
  const next = read().filter((i) => !sameLine(i, id, billing))
  write(next)
  return next
}

export function clearLocal() {
  write([])
}

export function subscribeLocal(cb) {
  const refresh = () => cb(read())
  window.addEventListener('cart-changed', refresh)
  window.addEventListener('storage', refresh)
  refresh()
  return () => {
    window.removeEventListener('cart-changed', refresh)
    window.removeEventListener('storage', refresh)
  }
}
