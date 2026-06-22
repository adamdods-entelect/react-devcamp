// Fetches the logged-in customer's profile from the client service.
// Used to resolve the customer's id (e.g. to scope KYC uploads) when it
// wasn't passed through route state. Returns the CustomerDto or null.
export async function getProfile() {
  const token = localStorage.getItem('accessToken')
  if (!token) return null

  const res = await fetch('/client/v1/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}
