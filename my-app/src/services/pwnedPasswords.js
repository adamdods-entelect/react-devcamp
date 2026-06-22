// Checks a password against HaveIBeenPwned's Pwned Passwords range API using
// k-anonymity: only the first 5 chars of the SHA-1 hash are sent over the wire,
// so the password itself never leaves the browser.
// Returns the number of times the password appears in known breaches (0 = clean).
// Throws on network/API failure so the caller can decide how to handle it.
export async function pwnedCount(password) {
  const hash = await sha1Hex(password)
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5) // already uppercase

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' }, // pads the response so the count can't be inferred from its size
  })
  if (!res.ok) throw new Error(`HIBP ${res.status}`)

  const text = await res.text()
  for (const line of text.split('\n')) {
    const [hashSuffix, count] = line.trim().split(':')
    if (hashSuffix === suffix) return Number(count)
  }
  return 0
}

async function sha1Hex(str) {
  const bytes = new TextEncoder().encode(str)
  const digest = await crypto.subtle.digest('SHA-1', bytes)
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}
