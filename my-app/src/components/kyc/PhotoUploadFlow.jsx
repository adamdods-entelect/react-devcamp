import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Camera, FileText } from 'lucide-react'
import PrepSheet from './PrepSheet'

const DEFAULT_PREP = {
    title: 'Prep for your photo',
    tips: [
        { title: 'Start with good lighting', body: 'Ensure the photo is well-lit space and clear.' },
        { title: 'Avoid face obstructions', body: 'Ensure that nothing covers your face. Eyeglasses are okay.' },
    ],
}

function PhotoUploadFlow({ noun = 'photo', accept = 'image/*', prep = DEFAULT_PREP, onSubmit, onClose, onSwitchToCamera }) {
    const inputRef = useRef(null)
    const [phase, setPhase] = useState('prep') // prep | review
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)

    // release the object URL when it changes or the component unmounts
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview)
        }
    }, [preview])

    const openPicker = () => inputRef.current?.click()

    const handleFile = (e) => {
        const picked = e.target.files?.[0]
        e.target.value = '' // allow re-picking the same file
        if (!picked) return
        if (preview) URL.revokeObjectURL(preview)
        setFile(picked)
        setPreview(picked.type.startsWith('image/') ? URL.createObjectURL(picked) : null)
        setPhase('review')
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900">
            <div className="flex items-center justify-between p-4">
                <button onClick={onClose} className="text-white" aria-label="Back">
                    <ChevronLeft className="h-7 w-7" />
                </button>
                {onSwitchToCamera && (
                    <button onClick={onSwitchToCamera} className="text-white" aria-label="Use camera instead">
                        <Camera className="h-6 w-6" />
                    </button>
                )}
            </div>

            <div className="flex flex-1 items-center justify-center overflow-hidden px-6">
                {preview ? (
                    <img src={preview} alt="Selected preview" className="max-h-full max-w-full rounded-2xl object-contain" />
                ) : file ? (
                    <div className="flex flex-col items-center text-white/80">
                        <FileText className="h-16 w-16" />
                        <p className="mt-3 max-w-[15rem] truncate text-sm">{file.name}</p>
                    </div>
                ) : (
                    <p className="text-white/60">Choose a file to continue</p>
                )}
            </div>

            {phase === 'review' && (
                <div className="mx-auto w-full max-w-sm p-6">
                    <p className="text-center font-semibold text-white">Review your {noun}</p>
                    <p className="mt-1 text-center text-sm text-white/60">
                        Make sure the document is clear and all details are visible
                    </p>
                    <button
                        onClick={() => onSubmit(file)}
                        className="mt-4 w-full rounded-full bg-white py-3 font-semibold text-black"
                    >
                        Submit {noun}
                    </button>
                    <button
                        onClick={openPicker}
                        className="mt-3 w-full rounded-full border border-white/30 py-3 font-semibold text-white"
                    >
                        Change {noun}
                    </button>
                </div>
            )}

            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />

            {phase === 'prep' && (
                <PrepSheet title={prep.title} tips={prep.tips} onContinue={openPicker} onClose={onClose} />
            )}
        </div>
    )
}

export default PhotoUploadFlow
