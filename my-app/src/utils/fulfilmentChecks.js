// Friendly labels + reason text for the backend fulfilment checks returned in a
// take-up's fulfilmentResultList. Names are the exact backend checkName values.
const LABELS = {
  KYC: 'KYC verification',
  Credit: 'Credit check',
  'Living Status': 'Living status',
  Fraud: 'Fraud check',
  'Duplicate ID': 'Duplicate ID',
  'Marital Status': 'Marital status',
}

// A readable label for a check name, falling back to the raw name.
export function checkLabel(name) {
  return LABELS[name] ?? name
}

// Turn a list of failed checks ([{ name, message }]) into user-facing reason
// strings, preferring the backend's failureMessage.
export function declineReasons(failedChecks = []) {
  return failedChecks.map(({ name, message }) =>
    message ? `${checkLabel(name)}: ${message}` : `${checkLabel(name)} check did not pass`
  )
}
