import { pdf } from '@react-pdf/renderer'
import ProductDocument from '../components/product/ProductDocument'

// Builds a product-details PDF in the browser and triggers a download (Milestone 7).
export async function downloadProductPdf(product) {
  const blob = await pdf(<ProductDocument product={product} />).toBlob()
  const url = URL.createObjectURL(blob)
  const slug = product.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '')
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug || 'product'}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
