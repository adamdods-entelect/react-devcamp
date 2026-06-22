import { useForm } from 'react-hook-form'

const SA_ID_PATTERN = /^\d{13}$/

// Screens 18–19. Collects firstName, lastName, idNumber.
// Calls onNext({ firstName, lastName, idNumber }) when all are valid.
function AboutYouStep({ onNext, defaultValues = {} }) {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm({ mode: 'onChange', defaultValues })

  const submit = (values) => onNext(values)

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
            field={register('idNumber', { required: true, pattern: SA_ID_PATTERN })}
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

function Field({ id, label, field, inputMode }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
        {label}
      </label>
      <input
        id={id}
        inputMode={inputMode}
        className="w-full rounded-md border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-cyan-500"
        {...field}
      />
    </div>
  )
}

export default AboutYouStep
