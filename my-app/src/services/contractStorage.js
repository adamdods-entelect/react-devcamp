import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadContract(customerId, contractId, blob) {
  const path = `contracts/${customerId}/${contractId}.pdf`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, blob, { contentType: 'application/pdf' })
  return getDownloadURL(storageRef)
}