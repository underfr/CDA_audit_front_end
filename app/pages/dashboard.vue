<script setup lang="ts">
/**
 * @file Dashboard (`/dashboard`): greeting, indicators and open tickets of the signed-in user,
 * with texts adapted to their role.
 */

import { TicketService } from '~/services/firebase/ticket.service'
import type { Role, Ticket } from '~/types'

useHead({ title: 'Tableau de bord' })

/** Profile of the signed-in user, guaranteed by the auth middleware. */
const profile = useProfile()
/** Role of the signed-in user. */
const role = profile.value!.role
/** Tickets of the user, updated in real time. */
const tickets = ref<Ticket[]>([])
/** Whether the first load of the tickets is running. */
const pending = ref(true)

/** Stops listening to the tickets. */
const stopListening = new TicketService().listFor(profile.value!, (list) => {
  tickets.value = list
  pending.value = false
})
onUnmounted(stopListening)

/** Indicators of the page. */
const stats = computed(() => computeDashboardStats(tickets.value, role))
/** Open tickets, most recently updated first. */
const activeTickets = computed(() =>
    tickets.value
        .filter(isOpen)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
)

/** Texts of the page for each role: subtitle, panel title and link to the ticket list. */
const TEXTS: Record<Role, { subtitle: string; panel: string; link: string }> = {
  collaborator: { subtitle: 'Voici l’état actuel de vos demandes d’assistance.', panel: 'Mes tickets en cours', link: 'Voir tous mes tickets' },
  technician: { subtitle: 'Voici les tickets qui vous sont affectés.', panel: 'Mes tickets affectés en cours', link: 'Voir tous mes tickets' },
  manager: { subtitle: 'Voici l’activité de tout le support.', panel: 'Tickets en cours', link: 'Voir tous les tickets' },
  admin: { subtitle: 'Voici l’activité de tout le support.', panel: 'Tickets en cours', link: 'Voir tous les tickets' },
}
/** Texts for the role of the signed-in user. */
const texts = TEXTS[role]
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader :title="`Bonjour, ${profile?.displayName}`" :subtitle="texts.subtitle">
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

    <UiPanel :title="texts.panel">
      <template #actions>
        <NuxtLink to="/tickets" class="link text-sm">{{ texts.link }}</NuxtLink>
      </template>
      <TicketList :tickets="activeTickets" :pending="pending" />
    </UiPanel>
  </div>
</template>
