import { useNavigate } from 'react-router-dom'

function TopBar({ name }) {
    const navigate = useNavigate()

    return (
        <header className="flex items-center gap-3 px-4 py-3">
            <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="text-xl"
            >
                ←
            </button>
            <h2 className="truncate text-[17px] font-semibold">{name}</h2>
        </header>
    )
}

export default TopBar
