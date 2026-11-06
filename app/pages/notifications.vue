<script setup lang="ts">
/**
 * @file Notifications page (`/notifications`): paginated list of the user's notifications,
 * which can be marked as read one by one or all at once.
 */

import {
  listenNotifications,
  listenReadState,
  isNotificationUnread,
  markAsRead,
  markAllAsRead,
} from '../services/firebase/notification.service'
import type { AppNotification } from '../types'

const { $db } = useNuxtApp()
/** Profile of the signed-in user. */
const profile = useProfile()

/** Number of notifications per page. */
const PER_PAGE = 20

/** Notifications of the user, newest first. */
const notifications = ref<AppNotification[]>([])
/** Time of the last "mark all as read", in milliseconds. */
const lastRead = ref(0)
/** Notifications read one by one, by notification id. */
const readIds = ref<Record<string, boolean>>({})
/** Whether the page is waiting for its first data. */
const loading = ref(true)
/** Current page, starting at 1. */
const page = ref(1)

/** Whether the notifications listener has answered. */
let notificationsReady = false
/** Whether the read state listener has answered. */
let readStateReady = false

/** Ends the loading state once both listeners have answered. */
function checkLoaded() {
  if (notificationsReady && readStateReady) {
    loading.value = false
  }
}

/** Number of pages, at least 1. */
const totalPages = computed(() => Math.max(1, Math.ceil(notifications.value.length / PER_PAGE)))

/** Notifications of the current page. */
const pageNotifications = computed(() => {
  const start = (page.value - 1) * PER_PAGE
  return notifications.value.slice(start, start + PER_PAGE)
})

// If the last page disappears, go back to the last one that still exists
watch(totalPages, (value) => {
  if (page.value > value) {
    page.value = value
  }
})

/**
 * Tells whether a notification is unread according to the current read state.
 *
 * @param notification - Notification to check.
 * @returns `true` when the notification is unread.
 */
function isUnread(notification: AppNotification) {
  return isNotificationUnread(notification, lastRead.value, readIds.value)
}

/** Whether at least one notification is unread. */
const hasUnread = computed(() => notifications.value.some((n) => isUnread(n)))

/** Stops listening to the notifications; does nothing before the page is mounted. */
let stopNotifications = () => {}
/** Stops listening to the read state; does nothing before the page is mounted. */
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

/**
 * Marks an unread notification as read. Used by the button and by the click on the notification.
 *
 * @param notification - Notification to mark.
 */
function onMarkAsRead(notification: AppNotification) {
  if (!profile.value || !isUnread(notification)) return
  markAsRead($db, profile.value.id, notification.id)
}

/** Marks all the notifications as read. */
function onMarkAllAsRead() {
  if (!profile.value) return
  markAllAsRead($db, profile.value.id)
}

/**
 * Formats the date of a notification in French.
 *
 * @param timestamp - Time in milliseconds since the epoch.
 * @returns The formatted date and time.
 */
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString('fr-FR')
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4 p-4 sm:p-6 lg:p-8">
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
  </div>
</template>