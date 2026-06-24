import { logEvent } from 'firebase/analytics'
import { analyticsReady } from './firebase'

export async function track(event, params = {}) {
    const analytics = await analyticsReady
    if (analytics) logEvent(analytics, event, params)
}