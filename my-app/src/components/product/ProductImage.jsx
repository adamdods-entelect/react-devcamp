function ProductImage({ imageUrl, discount }) {
    return (
        <div className="relative p-4">
            {discount && (
                <span className="absolute left-7 top-7 rounded-md bg-[#2f6bff] px-2.5 py-1.5 text-xs font-bold text-white">
                    {discount}% OFF
                </span>
            )}
            <img
                src={imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAPf_062JKWOBQr9rKxfyjLtlwzCn6Wwx_fJ6vQDIAgQ&s=10'}
                alt=""
                className="block h-[260px] w-full rounded-lg object-cover md:h-[340px]"
            />
        </div>
    )
}

export default ProductImage
