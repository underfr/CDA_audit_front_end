import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

export default defineNuxtPlugin(()=>{
    const app = initializeApp(useRuntimeConfig().public.firebase)
    return {
        provide: {
            auth: getAuth(app),
            db: getDatabase(app)
        }
    }
})