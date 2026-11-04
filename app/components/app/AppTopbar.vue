<script setup lang="ts">
import { listenNotifications, listenReadState, isNotificationUnread } from '../../services/firebase/notification.service'
import type { AppNotification, UserProfile } from '../../types'

const props = defineProps<{ user: UserProfile }>()

const { $db } = useNuxtApp()

const notifications = ref<AppNotification[]>([])
const lastRead = ref(0)
const readIds = ref<Record<string, boolean>>({})
const readReady = ref(false)

// La pastille s'affiche s'il reste au moins une notification non lue
const hasUnread = computed(
  () => readReady.value && notifications.value.some((n) => isNotificationUnread(n, lastRead.value, readIds.value)),
)

let stopNotifications = () => {}
let stopReadState = () => {}

onMounted(() => {
  stopNotifications = listenNotifications($db, props.user, (list) => {
    notifications.value = list
  })

  stopReadState = listenReadState($db, props.user.id, (last, ids) => {
    lastRead.value = last
    readIds.value = ids
    readReady.value = true
  })
})

onUnmounted(() => {
  stopNotifications()
  stopReadState()
})
</script>

<template>
  <header
    class="sticky top-0 z-10 flex items-center gap-3 border-b border-base-300 bg-base-100 px-4 py-3 sm:px-6 lg:px-8">
    <label class="input h-8 w-150">
      <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </g>
      </svg>
      <input type="search" required placeholder="Rechercher un ticket, un utilisateur..." />
    </label>

    <label for="app-drawer" class="btn btn-square btn-ghost lg:hidden" aria-label="Ouvrir le menu">
      <AppIcon name="menu" />
    </label>

    <!-- Groupe de droite : notifications + séparation + profil -->
    <div class="ml-auto flex items-center gap-3">
      <NuxtLink
        to="/notifications"
        class="btn btn-square btn-ghost relative"
        :aria-label="hasUnread ? 'Notifications, de nouvelles notifications sont non lues' : 'Notifications'"
      >
        <AppIcon name="bell" />
        <span v-if="hasUnread" class="absolute top-2 right-2 size-2 rounded-full bg-error"></span>
      </NuxtLink>

      <div class="h-8 w-px bg-base-content/20"></div>

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