import { Camera, FilePlus, Image as ImageIcon } from 'lucide-react'

function UploadOptionsSheet({ open, docLabel, onUseCamera, onUploadPhoto, onUploadDocument, onClose }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full rounded-t-3xl bg-white px-6 pb-10 pt-6">
                <h2 className="text-lg font-bold">Upload {docLabel}</h2>

                <button onClick={onUseCamera} className="mt-6 flex w-full items-center gap-4 text-left">
                    <Camera className="h-5 w-5 text-gray-700" />
                    <span>Take photo with camera</span>
                </button>

                <button onClick={onUploadPhoto} className="mt-6 flex w-full items-center gap-4 text-left">
                    <FilePlus className="h-5 w-5 text-gray-700" />
                    <span>Upload photo</span>
                </button>

                {onUploadDocument && (
                    <button onClick={onUploadDocument} className="mt-6 flex w-full items-center gap-4 text-left">
                        <ImageIcon className="h-5 w-5 text-gray-700" />
                        <span>Upload document</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export default UploadOptionsSheet
