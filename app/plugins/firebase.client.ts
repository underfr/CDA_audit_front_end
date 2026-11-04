import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

export default defineNuxtPlugin(()=>{
    const app = initializeApp(useRuntimeConfig().public.firebase)
    return {
        provide: {
            auth: initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence] }),
            db: getDatabase(app)
        }
    }
})