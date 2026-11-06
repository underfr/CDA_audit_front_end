/**
 * @file Client-only Nuxt plugin initialising Firebase from the public runtime config.
 */

import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

/**
 * Creates the Firebase app and its services.
 *
 * @returns The `$auth` injection (Firebase Auth, keeping the session in IndexedDB, or else in
 * localStorage or sessionStorage) and the `$db` injection (Realtime Database).
 */
export default defineNuxtPlugin(()=>{
    const app = initializeApp(useRuntimeConfig().public.firebase)
    return {
        provide: {
            auth: initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence] }),
            db: getDatabase(app)
        }
    }
})