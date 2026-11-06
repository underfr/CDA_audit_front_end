<script setup lang="ts">
/**
 * @file Compact ticket list of the dashboard, with its loading, error and empty states.
 */

import type { Ticket } from '~/types'

defineProps<{
  /** Tickets to display, in the given order. */
  tickets: Ticket[]
  /** Shows the loading state instead of the list. */
  pending?: boolean
  /**
   * Error message displayed instead of the list.
   *
   * @todo Wire the retry button displayed with this message: it has no handler yet.
   */
  error?: string
}>()
</script>

<template>
  <p v-if="pending" role="status" class="flex items-center gap-2 text-base-content/75">
    <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
    Chargement des tickets…
  </p>

  <div v-else-if="error" role="alert" class="alert alert-error">
    <span>{{ error }}</span>
    <button type="button" class="btn btn-sm">Réessayer</button>
  </div>

  <UiEmptyState v-else-if="!tickets.length" message="Aucun ticket en cours.">
    <NuxtLink to="/tickets/new" class="link">Déclarer un incident</NuxtLink>
  </UiEmptyState>

  <ul v-else class="-mx-2 divide-y divide-base-300">
    <li v-for="ticket in tickets" :key="ticket.id">
      <NuxtLink :to="`/tickets/${ticket.id}`" class="flex items-center gap-4 rounded-field px-2 py-3 hover:bg-base-200">
        <div class="min-w-0 flex-1 space-y-1">
          <p class="font-semibold break-words">{{ ticket.title }}</p>
          <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/75">
            <TicketPriorityBadge :priority="ticket.priority" />
            <span>{{ ticketNumber(ticket) }}</span>
            <span>Mis à jour le <NuxtTime :datetime="ticket.updatedAt" locale="fr-FR" date-style="short" time-style="short" /></span>
          </p>
        </div>
        <div class="shrink-0 space-y-1 text-right text-sm">
          <TicketStatusBadge :status="ticket.status" />
          <p class="text-base-content/75">{{ ticket.assigneeName ?? 'Non assigné' }}</p>
        </div>
        <span aria-hidden="true" class="text-xl text-base-content/75">›</span>
      </NuxtLink>
    </li>
  </ul>
</template>
