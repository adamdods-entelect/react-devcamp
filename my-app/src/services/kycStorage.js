import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

// Uploads a KYC document to Firebase Storage and returns its download URL.
// docType is used to group files, e.g. "kyc/selfie/1718...jpg".
export async function uploadKycDocument(docType, file) {
    const ext = file.name?.includes('.') ? file.name.split('.').pop() : 'jpg'
    const path = `kyc/${docType}/${Date.now()}.${ext}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    return getDownloadURL(storageRef)
}
