// "New arrivals" = the most recently added products. The catalogue exposes no
// date field, so we use id descending as a proxy for recency (auto-increment IDs).
// Pass a limit for the home row; omit it to get the full sorted list (View all).
export function getNewArrivals(products, limit) {
  const sorted = [...products].sort((a, b) => b.id - a.id)
  return limit ? sorted.slice(0, limit) : sorted
}
