function ProductImage({ imageUrl, discount }) {
    return (
        <div className="relative p-4">
            {discount && (
                <span className="absolute left-7 top-7 rounded-md bg-[#2f6bff] px-2.5 py-1.5 text-xs font-bold text-white">
                    {discount}% OFF
                </span>
            )}
            <img
                src={imageUrl || 'https://picsum.photos/400/300'}
                alt=""
                className="block h-[260px] w-full rounded-lg object-cover"
            />
        </div>
    )
}

export default ProductImage
