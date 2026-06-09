function RelatedProducts({ products }) {
    return (
        <section className="related">
            <h3 className="related-heading">Related product</h3>
            <div className="related-row">
                {products.map((item) => (
                    <article key={item.id} className="related-card">
                        <img src={item.imageUrl} alt="" className="related-card-image" />
                        <p className="related-card-name">{item.name}</p>
                        <p className="related-card-price">R {item.price.toFixed(2)}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default RelatedProducts