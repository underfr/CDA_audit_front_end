/**
 * @file Composable creating user accounts from the administration page.
 */

import { deleteApp, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, initializeAuth, inMemoryPersistence, sendPasswordResetEmail } from 'firebase/auth'
import { ref as dbRef, set } from 'firebase/database'
import type { Role } from '~/types'

/**
 * Provides the function that creates a user account.
 * Call it in a composable or in a script setup, because it uses `useNuxtApp()`.
 *
 * @returns The account creation function.
 */
export function useCreateAccount() {
    const { $auth, $db } = useNuxtApp()
    const config = useRuntimeConfig().public.firebase

    /**
     * Creates the Firebase Auth account with a random password, stores the profile
     * and sends an e-mail letting the new user choose a password.
     * A temporary secondary Firebase app does the creation, because signing up a user
     * signs them in and would otherwise replace the administrator's session.
     *
     * @param account - Display name, e-mail address and role of the new user.
     * @returns A promise resolved once the profile is stored and the e-mail sent.
     * @throws FirebaseError if a step fails, for example `auth/email-already-in-use`.
     */
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