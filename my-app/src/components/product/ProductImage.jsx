import { productImage } from '../../utils/productImage'

function ProductImage({ productId, imageUrl, discount }) {
    return (
        <div className="relative p-4">
            {discount && (
                <span className="absolute left-7 top-7 rounded-md bg-[#2f6bff] px-2.5 py-1.5 text-xs font-bold text-white">
                    {discount}% OFF
                </span>
            )}
            <img
                src={imageUrl || productImage(productId)}
                alt=""
                className="mx-auto block aspect-square w-full max-w-md rounded-lg bg-white object-contain"
            />
        </div>
    )
}

export default ProductImage
