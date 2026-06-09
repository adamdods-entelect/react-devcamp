function PriceBar({ price }) {
    return (
        <footer className="price-bar">
            <div className="price">
                <span className="price-amount">R {price.toFixed(2)}</span>
                <span className="price-period">per month</span>
            </div>
            <button className="add-to-cart" type="button">Add to cart</button>
        </footer>
    )
}

export default PriceBar