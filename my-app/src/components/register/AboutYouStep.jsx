import { useForm, useWatch } from 'react-hook-form'
import { isValidSaId } from '../../utils/saId'

// Screens 18–19. Collects firstName, lastName, idNumber.
// Calls onNext({ firstName, lastName, idNumber }) when all are valid.
function AboutYouStep({ onNext, defaultValues = {} }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid, errors },
  } = useForm({ mode: 'onChange', defaultValues })

  const submit = (values) => onNext(values)

  const idValue = useWatch({ control, name: 'idNumber' }) ?? ''
  const idValid = isValidSaId(idValue)

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-6 py-10">
      <h1 className="mt-12 text-center text-2xl font-bold">Welcome to InsureTechGuard</h1>
      <p className="mt-2 text-center text-gray-500">Tell us about yourself</p>

      <form onSubmit={handleSubmit(submit)} className="mt-8 flex flex-1 flex-col" noValidate>
        <div className="space-y-4">
          <Field id="firstName" label="Name" field={register('firstName', { required: true })} />
          <Field id="lastName" label="Surname" field={register('lastName', { required: true })} />
          <Field
            id="idNumber"
            label="ID number"
            inputMode="numeric"
            error={errors.idNumber?.message}
            valid={idValid}
            field={register('idNumber', {
              required: 'ID number is required',
              validate: (value) => isValidSaId(value) || 'Enter a valid SA ID number',
            })}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className={`mt-6 w-full rounded-full py-3 font-semibold transition-colors ${
            isValid
              ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          Next
        </button>
      </form>
    </div>
  )
}

function Field({ id, label, field, inputMode, error, valid }) {
  const borderClass = error
    ? 'border-red-500 focus:border-red-500'
    : valid
      ? 'border-green-500 focus:border-green-500'
      : 'border-gray-300 focus:border-cyan-500'

  return (
    <div>
      <div className="relative">
        <label htmlFor={id} className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
          {label}
        </label>
        <input
          id={id}
          inputMode={inputMode}
          aria-invalid={error ? 'true' : 'false'}
          className={`w-full rounded-md border px-3 py-3 pr-10 text-gray-900 outline-none ${borderClass}`}
          {...field}
        />
        {valid && !error && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
            ✓
          </span>
        )}
      </div>
      {error && <p className="mt-1 px-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default AboutYouStep
