<script setup lang="ts">
import { TicketService } from '~/services/firebase/ticket.service'
import type { Ticket, TicketFilterValues } from '~/types'

definePageMeta({ roles: ['collaborator', 'technician', 'manager', 'admin'] })
useHead({ title: 'Tickets' })

const profile = useProfile()
const tickets = ref<Ticket[]>([])
const pending = ref(true)

const stopListening = new TicketService().listFor(profile.value!, (list) => {
  tickets.value = list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  pending.value = false
})
onUnmounted(stopListening)

const filters = reactive<TicketFilterValues>({ search: '', status: '', priority: '', categoryId: '' })
const filteredTickets = computed(() => filterTickets(tickets.value, filters))

const categories = computed(() =>
    [...new Map(tickets.value.map((t) => [t.categoryId, t.categoryName]))]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
)

const stats = computed(() => computeTicketListStats(tickets.value))
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
