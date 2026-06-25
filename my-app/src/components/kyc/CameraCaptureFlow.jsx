import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { X } from 'lucide-react'
import PrepSheet from './PrepSheet'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

async function dataUrlToFile(dataUrl, filename) {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type })
}

function CameraCaptureFlow({
    shape = 'rect', // 'rect' (full frame) | 'oval' (face guide)
    mirrored = false,
    facingMode = 'environment',
    noun = 'photo',
    filename = 'capture.jpg',
    frameCaption,
    capturingCaption = 'Hold still, capturing...',
    reviewTitle,
    reviewHelp,
    prep,
    onSubmit,
    onClose,
}) {
    const webcamRef = useRef(null)
    const [phase, setPhase] = useState(prep ? 'prep' : 'frame') // prep | frame | capturing | review
    const [shot, setShot] = useState(null)
    const [error, setError] = useState('')

    const capture = useCallback(() => {
        setPhase('capturing')
        setTimeout(() => {
            const src = webcamRef.current?.getScreenshot()
            if (src) {
                setShot(src)
                setPhase('review')
            } else {
                setPhase('frame')
            }
        }, 600)
    }, [])

    const submit = async () => {
        const file = await dataUrlToFile(shot, filename)
        if (file.size > MAX_FILE_SIZE) {
            setError(`${noun.charAt(0).toUpperCase() + noun.slice(1)} is too large. Please retake under 10MB.`)
            return
        }
        setError('')
        onSubmit(file)
    }

    const retake = () => {
        setShot(null)
        setError('')
        setPhase('frame')
    }

    const isOval = shape === 'oval'
    const frameClass = isOval
        ? 'relative aspect-[3/4] w-72 overflow-hidden rounded-[50%] border-2 border-white'
        : 'relative h-full w-full overflow-hidden'

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900">
            <button onClick={onClose} className="absolute left-4 top-4 z-20 text-white" aria-label="Close">
                <X className="h-7 w-7" />
            </button>

            <div className={isOval ? 'flex flex-1 flex-col items-center justify-center px-6' : 'relative flex-1 min-h-0'}>
                <div className={frameClass}>
                    {shot ? (
                        <img src={shot} alt="Captured preview" className="h-full w-full object-cover" />
                    ) : (
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            mirrored={mirrored}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode }}
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                {/* captions (oval layout shows them below the frame) */}
                {isOval && phase === 'frame' && frameCaption && (
                    <p className="mt-8 text-center font-semibold text-white">{frameCaption}</p>
                )}
                {isOval && phase === 'capturing' && (
                    <p className="mt-8 text-center font-semibold text-white">{capturingCaption}</p>
                )}
                {isOval && phase === 'review' && reviewTitle && (
                    <div className="mt-8 text-center">
                        <p className="font-semibold text-white">{reviewTitle}</p>
                        {reviewHelp && <p className="mt-1 text-sm text-white/60">{reviewHelp}</p>}
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center gap-4 p-8">
                {phase === 'frame' && (
                    <button
                        onClick={capture}
                        className="h-16 w-16 rounded-full border-4 border-white bg-white/30"
                        aria-label="Shutter"
                    />
                )}
                {phase === 'capturing' && <div className="h-16 w-16 rounded-full bg-white/20" />}
                {phase === 'review' && (
                    <>
                        {error && <p className="text-center text-sm text-red-400">{error}</p>}
                        <button onClick={submit} className="w-full rounded-full bg-white py-3 font-semibold text-black">
                            Submit {noun}
                        </button>
                        <button
                            onClick={retake}
                            className="w-full rounded-full border border-white/30 py-3 font-semibold text-white"
                        >
                            Retake {noun}
                        </button>
                    </>
                )}
            </div>

            {phase === 'prep' && prep && (
                <PrepSheet title={prep.title} tips={prep.tips} onContinue={() => setPhase('frame')} onClose={onClose} />
            )}
        </div>
    )
}

export default CameraCaptureFlow
