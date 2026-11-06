/**
 * @file Global route guard enforcing authentication, active accounts and per-page roles.
 */

import { signOut } from 'firebase/auth'
import { get, ref as dbRef } from 'firebase/database'

/**
 * Runs before every navigation and decides whether it continues:
 * - signed-out visitors can only open `/login`;
 * - the profile is loaded into `useProfile()` when it is missing or belongs to another user;
 * - accounts with no profile or disabled accounts are signed out and sent to `/login`;
 * - signed-in users opening `/login`, or a page whose `roles` meta excludes them, go to `/dashboard`.
 *
 * @param to - Target route.
 * @returns A redirection, or `undefined` to let the navigation continue.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const { $auth, $db } = useNuxtApp()
    await $auth.authStateReady()
    const user = $auth.currentUser
    const profile = useProfile()

    if (!user) {
        profile.value = null
        return to.path === '/login' ? undefined : navigateTo('/login')
    }

    if (profile.value?.id !== user.uid) {
        const snapshot = await get(dbRef($db, `users/${user.uid}`))
        profile.value = snapshot.exists() ? { id: user.uid, ...snapshot.val() } : null
    }

    if (!profile.value?.active) {
        await signOut($auth)
        return navigateTo('/login')
    }

    if (to.path === '/login') return navigateTo('/dashboard')

    if (to.meta.roles && !to.meta.roles.includes(profile.value.role)) return navigateTo('/dashboard')
})