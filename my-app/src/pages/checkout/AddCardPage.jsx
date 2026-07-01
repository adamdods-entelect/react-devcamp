import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import useCart from '../../hooks/useCart'
import { addCard } from '../../services/paymentMethods'
import { isValidCardNumber, isValidExpiry, isValidCvc } from '../../utils/card'
import TopNav from '../../components/home/TopNav'
import CheckoutHeader from '../../components/checkout/CheckoutHeader'
import EmptyCheckout from '../../components/checkout/EmptyCheckout'

// Step 1a of checkout (wireframe 4): enter card details. On save the card is
// stored (display-safe fields only) and auto-selected, then we go back to the
// payment-method list.
function AddCardPage() {
  const navigate = useNavigate()
  const items = useCart()
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({ mode: 'onChange' })

  if (items.length === 0) return <EmptyCheckout />

  const onSubmit = ({ holderName, number, expiry, cvc }) => {
    addCard({ holderName, number, expiry, cvc })
    navigate('/checkout')
  }

  return (
    <>
      <TopNav />
      <div className="mx-auto flex min-h-svh max-w-md flex-col px-6 pb-10 md:min-h-0">
        <CheckoutHeader title="Confirm and pay" />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-1 flex-col" noValidate>
          <div className="space-y-4">
            <Field
              id="holderName"
              label="Name of card holder"
              autoComplete="cc-name"
              error={errors.holderName?.message}
              field={register('holderName', { required: 'Card holder name is required' })}
            />
            <Field
              id="number"
              label="Card number"
              inputMode="numeric"
              autoComplete="cc-number"
              error={errors.number?.message}
              field={register('number', {
                required: 'Card number is required',
                validate: (v) => isValidCardNumber(v) || 'Enter a valid card number',
              })}
            />
            <div className="flex gap-4">
              <Field
                id="expiry"
                label="MM/YY"
                inputMode="numeric"
                autoComplete="cc-exp"
                error={errors.expiry?.message}
                field={register('expiry', {
                  required: 'Required',
                  validate: (v) => isValidExpiry(v) || 'Invalid date',
                })}
              />
              <Field
                id="cvc"
                label="CVC"
                inputMode="numeric"
                autoComplete="cc-csc"
                error={errors.cvc?.message}
                field={register('cvc', {
                  required: 'Required',
                  validate: (v) => isValidCvc(v) || 'Invalid CVC',
                })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`mt-auto w-full rounded-full py-3 font-semibold transition-colors md:mt-8 ${
              isValid
                ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            Next
          </button>
        </form>
      </div>
    </>
  )
}

function Field({ id, label, field, inputMode, autoComplete, error }) {
  return (
    <div className="flex-1">
      <div className="relative">
        <label htmlFor={id} className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
          {label}
        </label>
        <input
          id={id}
          inputMode={inputMode}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          className={`w-full rounded-md border px-3 py-3 text-gray-900 outline-none ${
            error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'
          }`}
          {...field}
        />
      </div>
      {error && <p className="mt-1 px-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default AddCardPage
