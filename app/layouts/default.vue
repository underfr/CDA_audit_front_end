<script setup lang="ts">
/**
 * Default layout: the sidebar wraps every page (daisyUI drawer).
 * The sign-out logic (Firebase) stays here, outside the presentational sidebar.
 */
async function handleLogout(): Promise<void> {
  // TODO: call the auth service (e.g. signOut(auth) from firebase/auth), then:
  await navigateTo('/login')
}
</script>

<template>
  <AppSidebar @logout="handleLogout">
    <main id="main-content" class="flex-1 p-6">
      <slot />
    </main>
  </AppSidebar>
</template>
