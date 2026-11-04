<script setup lang="ts">
import {
  listenNotifications,
  listenReadState,
  isNotificationUnread,
  markAsRead,
  markAllAsRead,
} from '../services/firebase/notification.service'
import type { AppNotification } from '../types'

const { $db } = useNuxtApp()
const profile = useProfile()

const PER_PAGE = 20

const notifications = ref<AppNotification[]>([])
const lastRead = ref(0)
const readIds = ref<Record<string, boolean>>({})
const loading = ref(true)
const page = ref(1)

// Pour savoir quand les deux écoutes ont répondu
let notificationsReady = false
let readStateReady = false

function checkLoaded() {
  if (notificationsReady && readStateReady) {
    loading.value = false
  }
}

// Pagination : 20 notifications par page
const totalPages = computed(() => Math.max(1, Math.ceil(notifications.value.length / PER_PAGE)))

const pageNotifications = computed(() => {
  const start = (page.value - 1) * PER_PAGE
  return notifications.value.slice(start, start + PER_PAGE)
})

// Si la dernière page disparaît, on revient sur la dernière existante
watch(totalPages, (value) => {
  if (page.value > value) {
    page.value = value
  }
})

function isUnread(notification: AppNotification) {
  return isNotificationUnread(notification, lastRead.value, readIds.value)
}

const hasUnread = computed(() => notifications.value.some((n) => isUnread(n)))

let stopNotifications = () => {}
let stopReadState = () => {}

onMounted(() => {
  // Pas de profil chargé : on n'affiche rien
  if (!profile.value) {
    loading.value = false
    return
  }

  stopNotifications = listenNotifications($db, profile.value, (list) => {
    notifications.value = list
    notificationsReady = true
    checkLoaded()
  })

  stopReadState = listenReadState($db, profile.value.id, (last, ids) => {
    lastRead.value = last
    readIds.value = ids
    readStateReady = true
    checkLoaded()
  })
})

onUnmounted(() => {
  stopNotifications()
  stopReadState()
})

// Utilisé par le bouton et par le clic sur la notification
function onMarkAsRead(notification: AppNotification) {
  if (!profile.value || !isUnread(notification)) return
  markAsRead($db, profile.value.id, notification.id)
}

function onMarkAllAsRead() {
  if (!profile.value) return
  markAllAsRead($db, profile.value.id)
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString('fr-FR')
}
</script>

<template>
  <main class="mx-auto max-w-3xl space-y-4 p-4 sm:p-6 lg:p-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Notifications</h1>
      <button class="btn btn-sm btn-outline" :disabled="!hasUnread" @click="onMarkAllAsRead">
        Tout marquer comme lu
      </button>
    </div>

    <p v-if="loading">Chargement…</p>

    <p v-else-if="notifications.length === 0" class="text-base-content/75">Aucune notification.</p>

    <template v-else>
      <ul class="space-y-2">
        <li
          v-for="notification in pageNotifications"
          :key="notification.id"
          class="card border border-base-300 bg-base-100 p-4"
          :class="{ 'border-primary': isUnread(notification) }"
        >
          <div class="flex items-start justify-between gap-4">
            <NuxtLink
              :to="'/tickets/' + notification.ticketId"
              class="min-w-0 flex-1"
              @click="onMarkAsRead(notification)"
            >
              <p class="font-semibold">{{ notification.title }}</p>
              <p class="text-sm">{{ notification.message }}</p>
              <p class="text-xs text-base-content/75">{{ formatDate(notification.createdAt) }}</p>
            </NuxtLink>

            <button
              v-if="isUnread(notification)"
              type="button"
              class="btn btn-xs btn-primary"
              @click="onMarkAsRead(notification)"
            >
              Marquer comme lue
            </button>
          </div>
        </li>
      </ul>

      <nav v-if="totalPages > 1" aria-label="Pagination" class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-sm text-base-content/75">Page {{ page }} sur {{ totalPages }}</p>
        <div class="join">
          <button
            type="button"
            class="join-item btn btn-sm"
            aria-label="Page précédente"
            :disabled="page === 1"
            @click="page--"
          >
            «
          </button>
          <button
            type="button"
            class="join-item btn btn-sm"
            aria-label="Page suivante"
            :disabled="page === totalPages"
            @click="page++"
          >
            »
          </button>
        </div>
      </nav>
    </template>
  </main>
</template>