<script setup lang="ts">
import { TicketService } from '~/services/firebase/ticket.service'
import type { Ticket } from '~/types'

useHead({ title: 'Tableau de bord' })

const profile = useProfile()
const tickets = ref<Ticket[]>([])
const pending = ref(true)

const stopListening = new TicketService().listByAuthor(profile.value!.id, (list) => {
  tickets.value = list
  pending.value = false
})
onUnmounted(stopListening)

const stats = computed(() => computeDashboardStats(tickets.value))
const activeTickets = computed(() =>
    tickets.value
        .filter(t => t.status === 'new' || t.status === 'in_progress')
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
)
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader :title="`Bonjour, ${profile?.displayName}`" subtitle="Voici l’état actuel de vos demandes d’assistance.">
      <template #actions>
        <NuxtLink to="/tickets/new" class="btn btn-primary">
          <AppIcon name="plus" />
          Nouveau ticket
        </NuxtLink>
      </template>
    </UiPageHeader>

    <section aria-labelledby="stats-title">
      <h2 id="stats-title" class="sr-only">Mes indicateurs</h2>
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li v-for="stat in stats" :key="stat.label">
          <UiStatCard v-bind="stat" />
        </li>
      </ul>
    </section>

    <UiPanel title="Mes tickets en cours">
      <template #actions>
        <NuxtLink to="/tickets" class="link text-sm">Voir tous mes tickets</NuxtLink>
      </template>
      <TicketList :tickets="activeTickets" :pending="pending" />
    </UiPanel>
  </div>
</template>
