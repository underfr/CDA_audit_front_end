export default defineNuxtRouteMiddleware(async (to) => {
    const { $auth } = useNuxtApp()
    await $auth.authStateReady()
    const loggedIn = $auth.currentUser !== null

    if (!loggedIn && to.path !== '/login') return navigateTo('/login')
    if (loggedIn && to.path === '/login') return navigateTo('/dashboard')
})