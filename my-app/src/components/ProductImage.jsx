function ProductImage({ imageUrl, discount }) {
    return (
        <div className="product-image-wrapper">
            {discount && <span className="discount-badge">{discount}% OFF</span>}
            <img src={imageUrl} alt="" className="product-image" />
        </div>
    )
}

export default ProductImage