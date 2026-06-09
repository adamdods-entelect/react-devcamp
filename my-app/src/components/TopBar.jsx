function TopBar({ name }) {
    return (
        <header className="top-bar">
            <button className="back-button" aria-label="Go back">←</button>
            <h2 className="top-bar-title">{name}</h2>
        </header>
    )
}

export default TopBar