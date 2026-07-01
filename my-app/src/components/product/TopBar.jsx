import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Share, Check } from 'lucide-react'

function TopBar({ name }) {
    const navigate = useNavigate()
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        const shareData = { title: name, text: `Check out ${name}`, url: window.location.href }
        try {
            if (navigator.share) {
                await navigator.share(shareData) // mobile: native share sheet
            } else {
                await navigator.clipboard.writeText(shareData.url) // desktop fallback
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
            }
        } catch {
            // user dismissed the sheet, or share/clipboard unavailable — ignore
        }
    }

    return (
        <header className="flex items-center gap-3 px-4 py-3">
            <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
                <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="flex-1 truncate text-[17px] font-semibold">{name}</h2>
            <button type="button" onClick={handleShare} aria-label="Share" className="shrink-0 text-gray-700">
                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Share className="h-5 w-5" />}
            </button>
        </header>
    )
}

export default TopBar
