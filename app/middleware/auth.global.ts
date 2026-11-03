import { signOut } from 'firebase/auth'
import { get, ref as dbRef } from 'firebase/database'

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