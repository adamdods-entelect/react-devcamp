import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage'
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

// Lists a customer's uploaded KYC documents by inspecting their folder in
// Storage (files are named "<docType>.<ext>", e.g. "selfie.jpg"). Returns a map
// of docType -> download URL (or null if not uploaded), e.g.
// { residence: "https://...", selfie: null }. Fails safe (all null).
export async function getKycStatus(customerId) {
    const result = { residence: null, selfie: null }
    if (!customerId) return result
    try {
        const { items } = await listAll(ref(storage, `kyc/${customerId}`))
        await Promise.all(
            items.map(async (item) => {
                const docType = item.name.split('.')[0] // "selfie.jpg" -> "selfie"
                if (docType in result) result[docType] = await getDownloadURL(item)
            })
        )
    } catch {
        // listing failed -> treat as nothing uploaded
    }
    return result
}
