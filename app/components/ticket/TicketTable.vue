<script setup lang="ts">
/**
 * @file Detailed ticket table, with its loading, error and empty states.
 */

import type { Ticket } from '~/types'

defineProps<{
  /** Tickets to display, in the given order. */
  tickets: Ticket[]
  /** Title of the table, read by screen readers. */
  caption: string
  /** Shows the loading state instead of the table. */
  pending?: boolean
  /**
   * Error message displayed instead of the table.
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

  <UiEmptyState v-else-if="!tickets.length" message="Aucun ticket ne correspond à ces critères." />

  <div
    v-else
    role="region"
    :aria-label="caption"
    tabindex="0"
    class="overflow-x-auto rounded-box border border-base-300 bg-base-100"
  >
    <table class="table">
      <caption class="sr-only">{{ caption }}</caption>
      <thead class="text-base-content/75">
        <tr>
          <th scope="col">Sujet</th>
          <th scope="col">Demandeur</th>
          <th scope="col">Technicien</th>
          <th scope="col">Priorité</th>
          <th scope="col">Statut</th>
          <th scope="col">Créé le</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.id" class="hover:bg-base-200">
          <td class="min-w-56">
            <NuxtLink :to="`/tickets/${ticket.id}`" class="link link-hover font-semibold">{{ ticket.title }}</NuxtLink>
            <p class="text-xs text-base-content/75">{{ ticketNumber(ticket) }} · {{ ticket.categoryName }}</p>
          </td>
          <td class="whitespace-nowrap">{{ ticket.authorName }}</td>
          <td class="whitespace-nowrap">{{ ticket.assigneeName ?? 'Non assigné' }}</td>
          <td><TicketPriorityBadge :priority="ticket.priority" /></td>
          <td><TicketStatusBadge :status="ticket.status" /></td>
          <td class="whitespace-nowrap">
            <NuxtTime :datetime="ticket.createdAt" locale="fr-FR" date-style="short" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
