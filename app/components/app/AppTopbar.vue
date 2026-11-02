<script setup lang="ts">
import type { UserProfile } from '~/types'

defineProps<{ user: UserProfile }>()
</script>

<template>
  <header class="sticky top-0 z-10 flex items-center gap-3 border-b border-base-300 bg-base-100 px-4 py-3 sm:px-6 lg:px-8">
    <label for="app-drawer" class="btn btn-square btn-ghost lg:hidden" aria-label="Ouvrir le menu">
      <AppIcon name="menu" />
    </label>

    <div class="ml-auto flex items-center gap-3">
      <div class="text-right leading-tight">
        <p class="text-sm font-semibold">{{ user.displayName }}</p>
        <p class="text-xs text-base-content/75">{{ ROLE_LABELS[user.role] }}</p>
      </div>
      <div class="avatar avatar-placeholder" aria-hidden="true">
        <div class="w-10 rounded-full bg-primary text-primary-content">
          <span class="font-semibold">{{ user.displayName.charAt(0) }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
