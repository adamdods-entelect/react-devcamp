async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function fetchProducts() {
  return getJson('/client/v1/products')
}

export function fetchProduct(id) {
  return getJson(`/client/v1/products/${id}`)
}
