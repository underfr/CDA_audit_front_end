<script setup lang="ts">
import { categories } from '~/fixtures/testData'
import { TicketService } from '~/services/firebase/ticket.service'
import type { Ticket } from '~/types'

definePageMeta({ roles: ['collaborator', 'technician', 'manager'] })
useHead({ title: 'Tickets' })

const profile = useProfile()
const tickets = ref<Ticket[]>([])
const pending = ref(true)

const stopListening = new TicketService().listFor(profile.value!, (list) => {
  tickets.value = list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  pending.value = false
})
onUnmounted(stopListening)

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

    <TicketFilters :categories="categories" />

    <TicketTable :tickets="tickets" :pending="pending" caption="Liste des tickets" />

    <nav aria-label="Pagination" class="flex flex-wrap items-center justify-between gap-4">
      <p class="text-sm text-base-content/75">Affichage de 1 à 8 sur 24 tickets</p>
      <div class="join">
        <button type="button" class="join-item btn btn-sm" aria-label="Page précédente" disabled>«</button>
        <button type="button" class="join-item btn btn-sm btn-active" aria-current="page">1</button>
        <button type="button" class="join-item btn btn-sm">2</button>
        <button type="button" class="join-item btn btn-sm">3</button>
        <button type="button" class="join-item btn btn-sm" aria-label="Page suivante">»</button>
      </div>
    </nav>
  </div>
</template>
