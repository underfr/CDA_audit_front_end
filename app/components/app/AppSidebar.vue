<script setup lang="ts">
/**
 * @file Sidebar of the main layout: logo, main navigation, new ticket link and sign-out button.
 */

import type { NavItem } from '~/types'
import { signOut } from 'firebase/auth'

defineProps<{
  /** Navigation links to display, already filtered by role. */
  items: NavItem[]
}>()

const { $auth } = useNuxtApp()

/**
 * Signs the user out, deletes the drafts kept on this computer and goes back to the login page.
 *
 * @returns A promise resolved once the navigation is complete.
 */
async function logout(){
  await signOut($auth)
  clearAllDrafts()
  await navigateTo('/login')
}
</script>

<template>
  <aside class="flex min-h-full w-72 flex-col gap-6 border-r border-base-300 bg-base-100 p-4">
    <NuxtLink to="/dashboard" class="rounded-field p-2">
  <AppLogo />
  <span class="sr-only">, tableau de bord</span>
</NuxtLink>

    <nav aria-label="Navigation principale" class="flex-1">
      <ul class="menu w-full gap-1 p-0">
        <li v-for="item in items" :key="item.to">
          <NuxtLink :to="item.to" active-class="menu-active">
            <AppIcon :name="item.icon" />
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="space-y-2 border-t border-base-300 pt-4">
      <NuxtLink to="/tickets/new" class="btn btn-primary w-full">
        <AppIcon name="plus" />
        Nouveau ticket
      </NuxtLink>
      <button type="button" class="btn btn-ghost w-full justify-start" @click="logout()">
        <AppIcon name="logout" />
        Déconnexion
      </button>
    </div>
  </aside>
</template>
