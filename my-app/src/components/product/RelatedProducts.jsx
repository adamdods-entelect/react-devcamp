function RelatedProducts({ products }) {
    return (
        <section className="px-4 pb-4">
            <h3 className="mb-3 border-t border-[#e5e4e7] pt-4 text-base font-bold">Related product</h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
                {products.map((item) => (
                    <article key={item.id} className="w-[150px] shrink-0">
                        <img
                            src={item.imageUrl || 'https://picsum.photos/200/150'}
                            alt=""
                            className="block h-[110px] w-full rounded-lg object-cover"
                        />
                        <p className="mb-0.5 mt-2 text-sm font-semibold text-[#08060d]">{item.name}</p>
                        <p className="text-[13px] text-[#6b6375]">R {item.price.toFixed(2)}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default RelatedProducts
