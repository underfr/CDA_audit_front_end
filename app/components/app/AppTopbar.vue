<script setup lang="ts">
/**
 * @file Top bar of the main layout: quick ticket search, unread notifications indicator
 * and identity of the signed-in user.
 */

import { listenNotifications, listenReadState, isNotificationUnread } from '~/services/firebase/notification.service'
import { TicketService } from '~/services/firebase/ticket.service'
import type { AppNotification, Ticket, UserProfile } from '~/types'

const props = defineProps<{
  /** Signed-in user; the listeners use the value received at setup. */
  user: UserProfile
}>()

const { $db } = useNuxtApp()

/** Notifications of the user, newest first. */
const notifications = ref<AppNotification[]>([])
/** Time of the last "mark all as read", in milliseconds. */
const lastRead = ref(0)
/** Notifications read one by one, by notification id. */
const readIds = ref<Record<string, boolean>>({})
/** Whether the read state has been received. */
const readReady = ref(false)

/** Whether the unread indicator is displayed; stays `false` until the read state is known. */
const hasUnread = computed(
  () => readReady.value && notifications.value.some((n) => isNotificationUnread(n, lastRead.value, readIds.value)),
)

/** Stops listening to the notifications; does nothing before the component is mounted. */
let stopNotifications = () => {}
/** Stops listening to the read state; does nothing before the component is mounted. */
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

/** Tickets of the user, in which the search looks. */
const tickets = ref<Ticket[]>([])
/** Stops listening to the tickets. */
const stopTickets = new TicketService().listFor(props.user, (list) => { tickets.value = list })

/** Text typed in the search field. */
const search = ref('')
/** Whether the results list may be displayed. */
const open = ref(false)
/** Five most recently updated tickets matching the search; empty when the search is blank. */
const results = computed(() =>
  search.value.trim()
    ? filterTickets(tickets.value, { search: search.value, status: '', priority: '', categoryId: '' })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5)
    : [],
)

/** Closes the results list and empties the search field. */
function close() {
  open.value = false
  search.value = ''
}

/** Opens the ticket list filtered by the typed text, then resets the search. */
function submit() {
  const value = search.value.trim()
  navigateTo({ path: '/tickets', query: value ? { search: value } : {} })
  close()
}

/**
 * Closes the results list when the focus leaves the search form.
 *
 * @param event - Focus event fired by the form.
 */
function onFocusOut(event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) open.value = false
}

onUnmounted(() => {
  stopNotifications()
  stopReadState()
  stopTickets()
})
</script>

<template>
  <header
    class="sticky top-0 z-10 flex items-center gap-3 border-b border-base-300 bg-base-100 px-4 py-3 sm:px-6 lg:px-8">
    <label for="app-drawer" class="btn btn-square btn-ghost lg:hidden">
  <AppIcon name="menu" />
  <span class="sr-only">Ouvrir le menu</span>
</label>

    <form
      role="search"
      class="relative hidden min-w-0 flex-1 md:block md:max-w-md"
      @submit.prevent="submit"
      @focusout="onFocusOut"
      @keydown.esc="open = false"
    >
      <label class="input h-8 w-full">
        <svg class="h-[1em] " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
  v-model="search"
  type="search"
  class="placeholder:text-base-content/80"
  autocomplete="off"
  aria-label="Rechercher un ticket"
  :aria-controls="open && search.trim() ? 'search-results' : undefined"
  placeholder="Rechercher un ticket (titre ou n°)"
  @focus="open = true"
  @input="open = true"
/>
      </label>

      <div
        v-if="open && search.trim()"
        id="search-results"
        class="absolute inset-x-0 top-full z-20 mt-1 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
      >
        <ul v-if="results.length">
          <li v-for="ticket in results" :key="ticket.id">
            <NuxtLink
              :to="`/tickets/${ticket.id}`"
              class="flex flex-col rounded-field px-3 py-2 hover:bg-base-200 focus:bg-base-200"
              @mousedown.prevent
              @click="close"
            >
              <span class="truncate text-sm font-medium">{{ ticket.title }}</span>
              <span class="text-xs text-base-content/80">{{ ticketNumber(ticket) }} · {{ STATUS_LABELS[ticket.status] }}</span>
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="px-3 py-2 text-sm text-base-content/80">Aucun ticket trouvé.</p>
      </div>

      <p role="status" class="sr-only">{{ open && search.trim() ? `${results.length} résultat(s)` : '' }}</p>
    </form>

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
        <p class="text-xs text-base-content/80">{{ ROLE_LABELS[user.role] }}</p>
      </div>
      <div class="avatar avatar-placeholder" aria-hidden="true">
        <div class="w-10 rounded-full bg-neutral text-neutral-content">
          <span class="font-semibold">{{ user.displayName.charAt(0) }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
<style scoped>
input::placeholder {
  color: #4b5563 !important;
  opacity: 1 !important;
}
</style>