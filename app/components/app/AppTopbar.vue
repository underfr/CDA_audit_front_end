<script setup lang="ts">
import { listenNotifications, listenReadState, isNotificationUnread } from '~/services/firebase/notification.service'
import { TicketService } from '~/services/firebase/ticket.service'
import type { AppNotification, Ticket, UserProfile } from '~/types'

const props = defineProps<{ user: UserProfile }>()

const { $db } = useNuxtApp()

// Notifications

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

// Recherche

const tickets = ref<Ticket[]>([])
const stopTickets = new TicketService().listFor(props.user, (list) => { tickets.value = list })

const search = ref('')
const open = ref(false)
const results = computed(() =>
  search.value.trim()
    ? filterTickets(tickets.value, { search: search.value, status: '', priority: '', categoryId: '' })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5)
    : [],
)

function close() {
  open.value = false
  search.value = ''
}

function submit() {
  const value = search.value.trim()
  navigateTo({ path: '/tickets', query: value ? { search: value } : {} })
  close()
}

// Ferme la liste quand le focus quitte la zone (clic ailleurs, Tab après le dernier résultat)
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
    <label for="app-drawer" class="btn btn-square btn-ghost lg:hidden" aria-label="Ouvrir le menu">
      <AppIcon name="menu" />
    </label>

    <form
      role="search"
      class="relative hidden min-w-0 flex-1 md:block md:max-w-md"
      @submit.prevent="submit"
      @focusout="onFocusOut"
      @keydown.esc="open = false"
    >
      <label class="input h-8 w-full">
        <svg class="h-[1em] opacity-50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          v-model="search"
          type="search"
          autocomplete="off"
          aria-label="Rechercher un ticket"
          aria-controls="search-results"
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
              <span class="text-xs text-base-content/75">{{ ticketNumber(ticket) }} · {{ STATUS_LABELS[ticket.status] }}</span>
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="px-3 py-2 text-sm text-base-content/75">Aucun ticket trouvé.</p>
      </div>

      <!-- Toujours présent dans la page, sinon les lecteurs d'écran n'annoncent pas les changements -->
      <p role="status" class="sr-only">{{ open && search.trim() ? `${results.length} résultat(s)` : '' }}</p>
    </form>

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