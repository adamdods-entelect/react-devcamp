import { auth } from './firebase'
import * as local from './cartLocal'
import * as remote from './cartRemote'

const uid = () => auth.currentUser?.uid ?? null

export function addToCart(product, billing = 'monthly') {
    const id = uid()
    return id ? remote.addRemote(id, product, billing) : local.addLocal(product, billing)
}

export function setQty(itemId, billing, qty) {
    const id = uid()
    return id ? remote.setQtyRemote(id, itemId, billing, qty) :local.setQtyLocal(itemId, billing, qty)
}

export function removeFromCart(itemId, billing) {
    const id = uid()
    return id ? remote.removeRemote(id, itemId, billing) : local.removeLocal(itemId, billing)
}

export function clearCart() {
    const id = uid()
    return id ? remote.clearRemote(id) : local.clearLocal()
}

export function subscribe(cb) {
    const id = uid()
    return id ? remote.subscribeRemote(id, cb) : local.subscribeLocal(cb)
}