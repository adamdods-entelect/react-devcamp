import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import kycIllustration from '../assets/kyc.png'
import UploadOptionsSheet from '../components/kyc/UploadOptionsSheet'
import CameraCaptureFlow from '../components/kyc/CameraCaptureFlow'
import PhotoUploadFlow from '../components/kyc/PhotoUploadFlow'
import { uploadKycDocument } from '../services/kycStorage'
import { seedKycStatus } from '../services/kyc'
import { getProfile } from '../services/profile'

const DOCS = {
    residence: {
        label: 'Proof of residence',
        allowDocument: true,
        camera: {
            shape: 'rect',
            facingMode: 'environment',
            noun: 'photo',
            filename: 'residence.jpg',
            prep: {
                title: 'Prep for your photo',
                tips: [
                    { title: 'Start with good lighting', body: 'Take the photo in a well-lit space. The flash might cause glare on you photo.' },
                    { title: 'Details visible', body: 'Ensure that the photo clearly displays your First name, Surname as well as residential address.' },
                    { title: 'Document period', body: 'Please ensure that the document snapshot you upload is no older than 3 months.' },
                ],
            },
        },
    },
    selfie: {
        label: 'Selfie',
        allowDocument: false,
        camera: {
            shape: 'oval',
            mirrored: true,
            facingMode: 'user',
            noun: 'selfie',
            filename: 'selfie.jpg',
            frameCaption: 'Move into the frame, check the lighting, then tap the shutter',
            reviewTitle: 'Review your photo',
            reviewHelp: 'Make sure your face is well-lit, clear and your entire face is visible',
            prep: {
                title: 'Prep for your selfie',
                tips: [
                    { title: 'Start with good lighting', body: 'Face forward and make sure your eyes are open and clearly visible.' },
                    { title: 'Avoid face obstructions', body: 'Remove anything that covers your face. Eyeglasses are okay.' },
                ],
            },
        },
    },
}

function KycPage() {
    const navigate = useNavigate()
    const location = useLocation()

    // Which customer these documents belong to. Comes from registration via
    // route state; fall back to fetching the logged-in profile (e.g. on refresh).
    const [customerId, setCustomerId] = useState(location.state?.customerId ?? null)

    useEffect(() => {
        if (customerId) return
        getProfile().then((p) => p && setCustomerId(p.id))
    }, [customerId])

    // per-document upload status: 'idle' | 'uploading' | 'done' | 'error'
    const [status, setStatus] = useState({ residence: 'idle', selfie: 'idle' })

    const [sheetDoc, setSheetDoc] = useState(null)   // which options sheet is open
    const [cameraDoc, setCameraDoc] = useState(null) // which camera is open
    const [upload, setUpload] = useState(null)       // { doc, accept, noun } for the upload flow

    const bothDone = status.residence === 'done' && status.selfie === 'done'

    // Bridge the in-app KYC flow to the backend: once both documents are uploaded,
    // mark the customer KYC-verified so the fulfilment KYC check passes (enabling
    // the contract at checkout — US8). Best-effort and runs once.
    const seededRef = useRef(false)
    useEffect(() => {
        if (!bothDone || !customerId || seededRef.current) return
        seededRef.current = true
        seedKycStatus(customerId).catch((e) => console.error('KYC seed failed', e))
    }, [bothDone, customerId])

    const startUpload = async (doc, file) => {
        if (!customerId) {
            console.error('No customerId — cannot attribute KYC upload to a user')
            setStatus((s) => ({ ...s, [doc]: 'error' }))
            return
        }
        setStatus((s) => ({ ...s, [doc]: 'uploading' }))
        try {
            await uploadKycDocument(customerId, doc, file)
            setStatus((s) => ({ ...s, [doc]: 'done' }))
        } catch (err) {
            console.error('KYC upload failed', err)
            setStatus((s) => ({ ...s, [doc]: 'error' }))
        }
    }

    const handleUseCamera = () => {
        setCameraDoc(sheetDoc)
        setSheetDoc(null)
    }

    const handleUploadPhoto = () => {
        setUpload({
            doc: sheetDoc,
            accept: 'image/*',
            noun: sheetDoc === 'selfie' ? 'selfie' : 'photo',
            prep: sheetDoc === 'residence' ? DOCS.residence.camera.prep : undefined,
        })
        setSheetDoc(null)
    }

    const handleUploadDocument = () => {
        setUpload({
            doc: sheetDoc,
            accept: 'application/pdf,image/*',
            noun: 'document',
            prep: DOCS.residence.camera.prep,
        })
        setSheetDoc(null)
    }

    const handleCapture = (file) => {
        const doc = cameraDoc
        setCameraDoc(null)
        startUpload(doc, file)
    }

    const handleUploadSubmit = (file) => {
        const doc = upload.doc
        setUpload(null)
        startUpload(doc, file)
    }

    const switchToCamera = () => {
        setCameraDoc(upload.doc)
        setUpload(null)
    }

    return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
            <div className="mt-8 flex justify-center">
                <img src={kycIllustration} alt="" className="h-40 w-auto" />
            </div>

            <h1 className="mt-8 text-3xl font-bold">Identity verification</h1>
            <p className="mt-3 text-gray-500">
                We are committed to providing a safe secure shopping experience for our
                community and therefore your account must be verified by completing a KYC
                verification.
            </p>

            <div className="mt-8 space-y-3">
                <KycCard
                    title="Proof of residence"
                    subtitle="Proof of identity"
                    status={status.residence}
                    onClick={() => setSheetDoc('residence')}
                />
                <KycCard
                    title="Selfie upload"
                    subtitle="Proof of identity"
                    status={status.selfie}
                    onClick={() => setSheetDoc('selfie')}
                />
            </div>

            {bothDone && (
                <button
                    onClick={() => navigate('/')}
                    className="mt-8 w-full rounded-full bg-blue-600 py-3 font-semibold text-white"
                >
                    Submit
                </button>
            )}

            <button
                onClick={() => navigate('/')}
                className="mx-auto mt-8 font-semibold text-cyan-500 underline"
            >
                Not now
            </button>

            <UploadOptionsSheet
                open={!!sheetDoc}
                docLabel={sheetDoc ? DOCS[sheetDoc].label : ''}
                onUseCamera={handleUseCamera}
                onUploadPhoto={handleUploadPhoto}
                onUploadDocument={sheetDoc && DOCS[sheetDoc].allowDocument ? handleUploadDocument : undefined}
                onClose={() => setSheetDoc(null)}
            />

            {cameraDoc && (
                <CameraCaptureFlow
                    {...DOCS[cameraDoc].camera}
                    onSubmit={handleCapture}
                    onClose={() => setCameraDoc(null)}
                />
            )}

            {upload && (
                <PhotoUploadFlow
                    noun={upload.noun}
                    accept={upload.accept}
                    prep={upload.prep}
                    onSubmit={handleUploadSubmit}
                    onClose={() => setUpload(null)}
                    onSwitchToCamera={switchToCamera}
                />
            )}
        </div>
    )
}

function KycCard({ title, subtitle, status, onClick }) {
    const done = status === 'done'
    const error = status === 'error'
    const uploading = status === 'uploading'

    return (
        <button
            onClick={onClick}
            disabled={uploading}
            className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left ${
                done
                    ? 'border-green-500 bg-green-50'
                    : error
                      ? 'border-red-400 bg-red-50'
                      : 'border-transparent bg-gray-100'
            }`}
        >
            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-gray-500">
                    {error ? 'Upload failed — tap to retry' : subtitle}
                </p>
            </div>
            {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : done ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
        </button>
    )
}

export default KycPage
