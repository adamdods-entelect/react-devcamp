function ProductImage({ imageUrl, discount }) {
    return (
        <div className="product-image-wrapper">
            {discount && <span className="discount-badge">{discount}% OFF</span>}
            <img src={imageUrl || 'https://picsum.photos/400/300'} alt="" className="product-image" />
        </div>
    )
}

export default ProductImage