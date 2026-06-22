import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

// Uploads a KYC document to Firebase Storage and returns its download URL.
// Files are scoped to the customer so each user's documents are separate,
// e.g. "kyc/8/selfie.jpg". Re-uploading a docType overwrites the previous one.
export async function uploadKycDocument(customerId, docType, file) {
    const ext = file.name?.includes('.') ? file.name.split('.').pop() : 'jpg'
    const path = `kyc/${customerId}/${docType}.${ext}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    return getDownloadURL(storageRef)
}
