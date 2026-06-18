import { useState } from 'react'

function ProductInfo({ name, description, benefits, requirements }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="p-4">
      <h1 className="mb-3 text-2xl font-bold">{name}</h1>
      <p className={`leading-normal text-[#6b6375] md:line-clamp-none ${expanded ? '' : 'line-clamp-3'}`}>
        {description}
      </p>

      <div className={`md:block ${expanded ? '' : 'hidden'}`}>
        <h3 className="mb-2 mt-4 border-t border-[#e5e4e7] pt-4 text-base font-bold">Benefits</h3>
        <ul className="list-disc pl-[18px] leading-relaxed text-[#6b6375]">
          {benefits.map((item) => <li key={item}>{item}</li>)}
        </ul>

        <h3 className="mb-2 mt-4 border-t border-[#e5e4e7] pt-4 text-base font-bold">Requirement</h3>
        <ul className="list-disc pl-[18px] leading-relaxed text-[#6b6375]">
          {requirements.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <button className="font-medium text-[#2f6bff] md:hidden" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Read less' : 'Read more'}
      </button>
    </section>
  )
}

export default ProductInfo
