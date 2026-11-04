<template>
  <div class="space-y-6">
    <UiPageHeader title="Pilotage du support" subtitle="Activité et charge de l’équipe support." />

    <section aria-labelledby="stats-title">
      <h2 id="stats-title" class="sr-only">Indicateurs clés</h2>
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li v-for="stat in analyticsStats" :key="stat.label">
          <UiStatCard v-bind="stat"/>
        </li>
      </ul>
    </section>

    <div class="grid items-start gap-6 xl:grid-cols-3">
      <div class="min-w-0 space-y-6 xl:col-span-2">
        <div class="grid items-start gap-6 md:grid-cols-2">
          <UiPanel title="Tickets ouverts par technicien">
            <UiBarList :items="workloadByTechnician" :max="maxOf(workloadByTechnician)" />
          </UiPanel>
          <UiPanel title="Tickets par statut">
            <UiBarList :items="ticketsByStatus" :max="maxOf(ticketsByStatus)" />
          </UiPanel>
        </div>

        <UiPanel title="Tickets urgents en cours">
          <template #actions>
            <NuxtLink to="/tickets" class="link text-sm">Voir tous les tickets</NuxtLink>
          </template>
          <TicketTable :tickets="urgentTickets" caption="Tickets urgents en cours" />
        </UiPanel>
      </div>

      <UiPanel title="Activité récente" class="min-w-0">
        <TicketHistory :entries="activityFeed" show-ticket />
      </UiPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TicketService } from '~/services/firebase/ticket.service'
import type { BarItem, HistoryEntry, Ticket } from '~/types'

definePageMeta({ roles: ['manager', 'admin'] })
useHead({ title: 'Pilotage' })

const ticketService = new TicketService()
const technicians = useTechnicians()

const tickets = ref<Ticket[]>([])
const stopTickets = ticketService.list((list) => {
  tickets.value = list
})

const history = ref<HistoryEntry[]>([])
const stopHistory = ticketService.watchAllHistory((entries) => {
  history.value = entries
})

onUnmounted(() => {
  stopTickets()
  stopHistory()
})

const analyticsStats = computed(() => computeAnalyticsStats(tickets.value))
const ticketsByStatus = computed(() => computeTicketsByStatus(tickets.value))
const workloadByTechnician = computed(() => computeWorkloadByTechnician(tickets.value, technicians.value))

const urgentTickets = computed(() =>
  tickets.value
    .filter(t => isOpen(t) && t.priority === 'urgent')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
)

// La création d'un ticket n'est pas écrite dans `history` : on la reconstruit depuis le ticket.
const activityFeed = computed(() => {
  const titles = new Map(tickets.value.map(t => [t.id, t.title]))
  const creations: HistoryEntry[] = tickets.value.map(t => ({
    id: `created-${t.id}`,
    ticketId: t.id,
    type: 'created',
    actorName: t.authorName,
    createdAt: t.createdAt,
  }))
  return [...history.value, ...creations]
    .map(entry => ({ ...entry, ticketTitle: titles.get(entry.ticketId) }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)
})

/** Valeur maximale des barres, pour que la plus longue remplisse la largeur. */
const maxOf = (items: BarItem[]) => Math.max(1, ...items.map(item => item.value))
</script>
