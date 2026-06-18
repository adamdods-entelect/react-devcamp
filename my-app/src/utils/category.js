export const categories = ['All', 'Insurance', 'Investments', 'Other']

export function getCategory(name) {
  if (/insurance/i.test(name)) return 'Insurance'
  if (/investment/i.test(name)) return 'Investments'
  return 'Other'
}
