<script setup lang="ts">
import { categories, ticketListStats, tickets } from '~/fixtures/testData'

useHead({ title: 'Tickets' })
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
        <li v-for="stat in ticketListStats" :key="stat.label">
          <UiStatCard v-bind="stat" />
        </li>
      </ul>
    </section>

    <TicketFilters :categories="categories" />

    <TicketTable :tickets="tickets" caption="Liste des tickets" />

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
