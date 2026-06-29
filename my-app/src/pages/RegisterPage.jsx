import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EmailStep from '../components/register/EmailStep'
import VerifyCodeStep from '../components/register/VerifyCodeStep'
import AboutYouStep from '../components/register/AboutYouStep'
import PasswordStep from '../components/register/PasswordStep'
import useAuth from '../hooks/useAuth'
import { registerCustomer } from '../services/registration'
import { signInWithGoogle } from '../services/googleAuth'
import { track } from '../services/analytics'

const FULL_STEPS = ['email', 'verify', 'about', 'password']
// Coming from Google we already have the email (verified by Google) and a derived
// password, so we only need the "about" step to collect names + ID number.
const GOOGLE_STEPS = ['about']

function RegisterPage() {
    const navigate = useNavigate()
    const location = useLocation()

    const { login } = useAuth()

    // Google can arrive two ways: via route state (button on the Login page) or via
    // the button on this page's first step. Either way it flips us to the about-only flow.
    const [google, setGoogle] = useState(location.state?.google ?? null)
    const STEPS = google ? GOOGLE_STEPS : FULL_STEPS
    
    const [step, setStep] = useState(0)
    const [data, setData] = useState(() =>
        google
            ? {
                  email: google.email,
                  password: google.password,
                  firstName: google.firstName,
                  lastName: google.lastName,
              }
            : {}
    )

    const startedRef = useRef(false)
    const completedRef = useRef(false)
    const stepRef = useRef(STEPS[step])

    // Keep the latest step name available to the unload handler.
    useEffect(() => {
        stepRef.current = STEPS[step]
    }, [step, STEPS])

    useEffect(() => {
        if (startedRef.current) return
        startedRef.current = true
        track('registration_started', { method: google ? 'google' : 'email' })
    }, [google])

    useEffect(() => {
        const onUnload = () => {
            if (!completedRef.current) track('registration_abandoned', { step: stepRef.current })
        }
        window.addEventListener('beforeunload', onUnload)
        return () => window.removeEventListener('beforeunload', onUnload)
    }, [])

    const handleGoogle = async () => {
        setError('')
        try {
            const res = await signInWithGoogle()
            if (res.kind === 'existing') {
                login(res.token) // returning user: both sessions active
                navigate('/')
                return
            }
            if (res.kind === 'exists') {
                // email was registered with a password -> Google can't log into it
                navigate('/login/signin', {
                    state: { notice: 'You already registered this email with a password. Please log in below.' },
                })
                return
            }
            // new Google user: switch this page to the about-only flow, pre-filled
            const gd = {
                email: res.email,
                password: res.password,
                firstName: res.firstName,
                lastName: res.lastName,
            }
            setData((d) => ({ ...d, ...gd }))
            setGoogle(gd)
            setStep(0)
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return
            setError('Could not sign in with Google. Please try again.')
        }
    }
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const next = (fields = {}) => {
        const merged = { ...data, ...fields }
        setData(merged)
        track('registration_step_completed', { step: STEPS[step] })
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1)
        } else {
            handleSubmit(merged)
        }
    }

    const back = () => {
        if (step === 0) {
            track('registration_abandoned', { step: STEPS[step] })
            navigate('/login')
        } else {
            setStep((s) => s - 1)
        }
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
                customerTypeId: all.customerTypeId,
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
            
            completedRef.current = true
            track('registration_completed', { method: google ? 'google' : 'email' })
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
                return <EmailStep onNext={next} onGoogle={handleGoogle} defaultEmail={data.email} />
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