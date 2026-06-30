import { pdf } from '@react-pdf/renderer'
import ContractDocument from '../components/contract/ContractDocument'
import { uploadContract } from './contractStorage'

// US8: build the PDF from profile + products, store it, return its URL.
export async function generateContract({ customer, products, totals }) {
  const date = new Date().toISOString().slice(0, 10)

   // pdf(<element>).toBlob() renders the document to a PDF Blob in-browser.
  const blob = await pdf(
    <ContractDocument customer={customer} products={products} totals={totals} date={date} />
  ).toBlob()

    const customerId = customer?.id ?? 'unknown'
  const contractId = `contract-${Date.now()}`
  return uploadContract(customerId, contractId, blob)
}