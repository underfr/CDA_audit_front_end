<script setup lang="ts">
import { currentUser, dashboardStats, myActiveTickets } from '~/fixtures/testData'

useHead({ title: 'Tableau de bord' })
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader :title="`Bonjour, ${currentUser.displayName}`" subtitle="Voici l’état actuel de vos demandes d’assistance.">
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
        <li v-for="stat in dashboardStats" :key="stat.label">
          <UiStatCard v-bind="stat" />
        </li>
      </ul>
    </section>

    <UiPanel title="Mes tickets en cours">
      <template #actions>
        <NuxtLink to="/tickets" class="link text-sm">Voir tous mes tickets</NuxtLink>
      </template>
      <TicketList :tickets="myActiveTickets" />
    </UiPanel>
  </div>
</template>
