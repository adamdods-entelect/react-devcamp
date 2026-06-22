import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmailStep from '../components/register/EmailStep'
import VerifyCodeStep from '../components/register/VerifyCodeStep'
import AboutYouStep from '../components/register/AboutYouStep'
import PasswordStep from '../components/register/PasswordStep'
import useAuth from '../hooks/useAuth'
import { registerCustomer } from '../services/registration'

const STEPS = ['email', 'verify', 'about', 'password']

function RegisterPage() {
    const navigate = useNavigate()

    const { login } = useAuth()

    const [step, setStep] = useState(0)
    const [data, setData] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const next = (fields = {}) => {
        const merged = { ...data, ...fields }
        setData(merged)
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1)
        } else {
            handleSubmit(merged)
        }
    }

    const back = () => {
        if (step === 0) navigate('/login')
        else setStep((s) => s - 1)
    }

    const handleSubmit = async (all) => {
        setSubmitting(true)
        setError('')
        try {
            const result = await registerCustomer({
                email: all.email,
                password: all.password,
                firstName: all.firstName,
                lastName: all.lastName,
                idNumber: all.idNumber,
            })

            if (!result.ok) {
                setSubmitting(false)
                if (result.reason === 'duplicate') {
                    setError('An account with that email already exists. Try logging in instead.')
                    setStep(0)
                } else {
                    setError('Could not create your profile. Please try again.')
                }
                return
            }

            login(result.token)
            navigate('/kyc', { state: { customerId: result.customer.id } })
        } catch {
            setSubmitting(false)
            setError('Could not reach the server. Please try again.')
        }
    }

    if (submitting) return <CompletingProfile />

    const renderStep = () => {
        switch (STEPS[step]) {
            case 'email':
                return <EmailStep onNext={next} defaultEmail={data.email} />
            case 'verify':
                return <VerifyCodeStep email={data.email} onNext={next} onBack={back} />
            case 'about':
                return <AboutYouStep onNext={next} defaultValues={data} />
            case 'password':
                return <PasswordStep onNext={next} defaultPassword={data.password} />
            default:
                return null
        }
    }

    return (
        <>
            {error && (
                <div className="fixed inset-x-0 top-0 z-50 bg-red-500 px-4 py-2 text-center text-sm text-white">
                    {error}
                </div>
            )}
            {renderStep()}
        </>
    )
}

function CompletingProfile() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center px-6">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500" />
            <p className="mt-6 text-lg font-medium text-gray-700">Completing your profile</p>
        </div>
    )
}

export default RegisterPage