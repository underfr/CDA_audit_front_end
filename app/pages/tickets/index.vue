<script setup lang="ts">
/**
 * @file Ticket management page (`/tickets`): indicators, filters and table of the tickets the user
 * works with. The search can be preset through the `search` query parameter.
 */

import { TicketService } from '~/services/firebase/ticket.service'
import type { Ticket, TicketFilterValues } from '~/types'

definePageMeta({ roles: ['collaborator', 'technician', 'manager', 'admin'] })
useHead({ title: 'Tickets' })

/** Profile of the signed-in user, guaranteed by the auth middleware. */
const profile = useProfile()
/** Tickets of the user, newest first and updated in real time. */
const tickets = ref<Ticket[]>([])
/** Whether the first load of the tickets is running. */
const pending = ref(true)

/** Stops listening to the tickets. */
const stopListening = new TicketService().listFor(profile.value!, (list) => {
  tickets.value = list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  pending.value = false
})
onUnmounted(stopListening)

/** Tickets matching the current filters. */
const filteredTickets = computed(() => filterTickets(tickets.value, filters))

/** Categories present on the loaded tickets, sorted by name, offered in the filter. */
const categories = computed(() =>
    [...new Map(tickets.value.map((t) => [t.categoryId, t.categoryName]))]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
)

/** Indicators computed on all the loaded tickets, whatever the filters. */
const stats = computed(() => computeTicketListStats(tickets.value))

const route = useRoute()

/** Current filter criteria; the search starts from the `search` query parameter. */
const filters = reactive<TicketFilterValues>({
  search: String(route.query.search ?? ''),
  status: '',
  priority: '',
  categoryId: '',
})
// The top bar can start a new search while this page is already open
watch(() => route.query.search, (value) => { filters.search = String(value ?? '') })
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader title="Gestion des tickets" subtitle="Suivez et traitez les demandes d’assistance.">
      <template #actions>
        <NuxtLink to="/tickets/new" class="btn btn-primary">
          <AppIcon name="plus" />
          Nouveau ticket
        </NuxtLink>
      </template>
    </UiPageHeader>

    <section aria-labelledby="stats-title">
      <h2 id="stats-title" class="sr-only">Indicateurs</h2>
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li v-for="stat in stats" :key="stat.label">
          <UiStatCard v-bind="stat" />
        </li>
      </ul>
    </section>

    <TicketFilters
        v-model:search="filters.search"
        v-model:status="filters.status"
        v-model:priority="filters.priority"
        v-model:categoryId="filters.categoryId"
        :categories="categories"
    />

    <TicketTable :tickets="filteredTickets" :pending="pending" caption="Liste des tickets" />

    <p v-if="!pending" role="status" class="text-sm text-base-content/75">
      {{ filteredTickets.length }} ticket(s) sur {{ tickets.length }}
    </p>

  </div>
</template>
