import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { getLocalCart, clearLocal } from './cartLocal'
import { mergeRemote } from './cartRemote'

export function initCartSync() {
    return onAuthStateChanged(auth, async (user) => {
        if(!user) return
        const guestItems = getLocalCart()
        if (guestItems.length === 0) return
        await mergeRemote(user.uid, guestItems)
        clearLocal()
    })
}