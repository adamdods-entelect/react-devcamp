import { useState } from 'react'

function ProductInfo({ name, description, benefits, requirements }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="product-info">
      <h1 className="product-name">{name}</h1>
      <p className={expanded ? 'product-description' : 'product-description clamped'}>
        {description}
      </p>

      {expanded && (
        <>
          <h3 className="section-heading">Benefits</h3>
          <ul className="detail-list">
            {benefits.map((item) => <li key={item}>{item}</li>)}
          </ul>

          <h3 className="section-heading">Requirement</h3>
          <ul className="detail-list">
            {requirements.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </>
      )}

      <button className="read-more" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Read less' : 'Read more'}
      </button>
    </section>
  )
}

export default ProductInfo