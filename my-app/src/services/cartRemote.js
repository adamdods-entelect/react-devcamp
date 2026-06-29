import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

const ref = (uid) => doc(db, 'carts', uid)
const sameLine = (i, id, billing) => i.id === id && i.billing === billing

async function readItems(uid) {
    const snap = await getDoc(ref(uid))
    return snap.exists() ? snap.data().items ?? [] : []
}

function writeItems(uid, items) {
    return setDoc(ref(uid), { items }, { merge: true })
}

export async function addRemote(uid, product, billing = 'monthly') {
    const items = await readItems(uid)
    const existing = items.find((i) => sameLine(i, product.id, billing))
    const next = existing
        ? items.map((i) => (sameLine(i, product.id, billing) ? { ...i, qty: i.qty + 1 } : i))
        : [
            ...items,
            { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, billing, qty: 1},
        ]
    await writeItems(uid, next)
}

export async function setQtyRemote(uid, id, billing, qty) {
    const items = await readItems(uid)
    const next =
        qty <=0
            ? items.filter((i) => !sameLine(i, id, billing))
            : items.map((i) => (sameLine(i, id, billing) ? { ...i, qty } : i))
        await writeItems(uid, next)
}

export async function removeRemote(uid, id, billing) {
    const items = await readItems(uid)
    await writeItems(uid, items.filter((i) => !sameLine(i, id, billing)))
}

export function clearRemote(uid) {
    return writeItems(uid, [])
}

export async function mergeRemote(uid, incoming) {
    const merged = [...(await readItems(uid))]
    for (const inc of incoming) {
        const existing = merged.find((i) => sameLine(i, inc.id, inc.billing))
        if (existing) existing.qty += inc.qty
        else merged.push({ ...inc })
    }
    await writeItems(uid, merged)
}

export function subscribeRemote(uid, cb) {
    return onSnapshot(ref(uid), (snap) => cb(snap.exists() ? snap.data().items ?? [] : []))
}