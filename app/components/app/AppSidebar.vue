<script setup lang="ts">
import type { NavItem } from '~/types'

defineProps<{ items: NavItem[] }>()
</script>

<template>
  <aside class="flex min-h-full w-72 flex-col gap-6 border-r border-base-300 bg-base-100 p-4">
    <NuxtLink to="/dashboard" class="rounded-field p-2" aria-label="Abstract Support, tableau de bord">
      <AppLogo />
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
      <button type="button" class="btn btn-ghost w-full justify-start">
        <AppIcon name="logout" />
        Déconnexion
      </button>
    </div>
  </aside>
</template>
