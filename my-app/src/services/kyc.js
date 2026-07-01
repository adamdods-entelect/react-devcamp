// Backend KYC *verification* status (BRS §8.2.1) — distinct from the in-app KYC
// document upload, which only stores files in Firebase (see kycStorage.js).
// The fulfilment KYC check at take-up reads this status.

// Marks a customer as KYC-verified in the backend KYC service. In the real BRS
// this verdict is owned by an external authority; for the devcamp we treat a
// completed in-app KYC flow (both documents uploaded) as that signal, so the
// fulfilment KYC check passes and a contract can be generated at checkout (US8).
// A passing status = primaryIndicator true + taxCompliance AMBER/GREEN.
export async function seedKycStatus(customerId) {
  const token = localStorage.getItem('accessToken')
  const res = await fetch(`/v1/kyc/${customerId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      primaryIndicator: true,
      secondaryIndicator: true,
      taxCompliance: 'green',
    }),
  })
  // 204 = created. Anything else is a real failure for the caller to handle.
  if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
}
