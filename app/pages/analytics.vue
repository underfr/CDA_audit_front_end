<script setup lang="ts">
import { activityFeed, analyticsStats, ticketsByStatus, urgentTickets, workloadByTechnician } from '~/fixtures/testData'
definePageMeta({ roles: ['manager'] })
useHead({ title: 'Pilotage' })
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader title="Pilotage du support" subtitle="Activité et charge de l’équipe support." />

    <section aria-labelledby="stats-title">
      <h2 id="stats-title" class="sr-only">Indicateurs clés</h2>
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li v-for="stat in analyticsStats" :key="stat.label">
          <UiStatCard v-bind="stat" />
        </li>
      </ul>
    </section>

    <div class="grid items-start gap-6 xl:grid-cols-3">
      <div class="min-w-0 space-y-6 xl:col-span-2">
        <div class="grid items-start gap-6 md:grid-cols-2">
          <UiPanel title="Tickets ouverts par technicien">
            <UiBarList :items="workloadByTechnician" :max="5" />
          </UiPanel>
          <UiPanel title="Tickets par statut">
            <UiBarList :items="ticketsByStatus" :max="8" />
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
