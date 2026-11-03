import { deleteApp, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, initializeAuth, inMemoryPersistence, sendPasswordResetEmail } from 'firebase/auth'
import { ref as dbRef, set } from 'firebase/database'
import type { Role } from '~/types'

export function useCreateAccount() {
    const { $auth, $db } = useNuxtApp()
    const config = useRuntimeConfig().public.firebase

    return async (account: { displayName: string, email: string, role: Role }) => {
        const secondary = initializeApp(config, 'creation-compte')
        try {
            const auth = initializeAuth(secondary, { persistence: inMemoryPersistence })
            const { user } = await createUserWithEmailAndPassword(auth, account.email, crypto.randomUUID())
            await set(dbRef($db, `users/${user.uid}`), { ...account, active: true })
            await sendPasswordResetEmail($auth, account.email)
        } finally {
            await deleteApp(secondary)
        }
    }
}