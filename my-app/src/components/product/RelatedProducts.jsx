import ProductCard from '../home/ProductCard'

function RelatedProducts({ products }) {
    return (
        <section className="px-4 pb-4">
            <h3 className="mb-3 border-t border-[#e5e4e7] pt-4 text-base font-bold">Related products</h3>
            {/* mobile: horizontal scroll carousel — desktop: grid (matches the home page) */}
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4">
                {products.map((item) => (
                    <div key={item.id} className="w-[160px] shrink-0 md:w-auto">
                        <ProductCard product={item} />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default RelatedProducts
