// Splits cart line items into once-off and monthly totals (plus the combined
// "pay now" amount). Shared by the cart and the checkout order summary so both
// add up the same way.
export function cartTotals(items) {
  const monthly = items
    .filter((i) => i.billing !== 'once')
    .reduce((sum, i) => sum + i.price * i.qty, 0)
  const once = items
    .filter((i) => i.billing === 'once')
    .reduce((sum, i) => sum + i.price * i.qty, 0)
  return { monthly, once, payNow: monthly + once }
}
