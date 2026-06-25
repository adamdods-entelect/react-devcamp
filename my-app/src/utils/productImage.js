// Per-product fallback images. The catalogue returns empty imageUrl for every
// product, so we map each product id to a bundled image in assets/product images.
import retailShortTerm from '../assets/product images/retail-short-term-insurance.png'
import retailLongTerm from '../assets/product images/retail-long-term-insurance.png'
import commercialShortTerm from '../assets/product images/commercial-short-term-insurance.png'
import commercialLongTerm from '../assets/product images/commercial-long-term-insurance.png'
import deviceContract from '../assets/product images/device-contract.png'
import shortTermInvestment from '../assets/product images/short-term-investment.png'
import longTermInvestment from '../assets/product images/long-term-investment.png'
import islamicInvestment from '../assets/product images/islamic-investment.png'
import vipInvestment from '../assets/product images/vip-investment.png'

// Keyed by the catalogue product id (stable across the API).
const IMAGES_BY_ID = {
  1: retailShortTerm,
  2: retailLongTerm,
  3: commercialShortTerm,
  4: commercialLongTerm,
  5: deviceContract,
  6: shortTermInvestment,
  7: longTermInvestment,
  8: islamicInvestment,
  9: vipInvestment,
}

// Resolves the image to show for a product: the API image if present, otherwise
// the bundled fallback for that id. Accepts an id or a product-like object.
export function productImage(idOrProduct) {
  if (idOrProduct && typeof idOrProduct === 'object') {
    return idOrProduct.imageUrl || IMAGES_BY_ID[idOrProduct.id] || ''
  }
  return IMAGES_BY_ID[idOrProduct] || ''
}
