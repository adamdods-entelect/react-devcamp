// Exchanges credentials for an access token via the auth service.
// Returns a result object so the UI can map reasons to messages;
// throws only on network failure (caller catches that).
export async function requestToken(email, password) {
  const res = await fetch('/v1/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${email}:${password}`),
    },
  })

  if (res.status === 401 || res.status === 403) {
    return { ok: false, reason: 'invalid' }
  }

  if (!res.ok) {
    return { ok: false, reason: 'server' }
  }

  const result = await res.json()
  if (!result.loginAccessKey) {
    return { ok: false, reason: 'rejected', message: result.errorMessage }
  }

  return { ok: true, token: result.loginAccessKey }
}
