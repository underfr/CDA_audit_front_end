<script setup lang="ts">
import type { HistoryEntry } from '~/types'

defineProps<{
  entries: HistoryEntry[]
  /** Affiche le lien vers le ticket concerné (flux d'activité). */
  showTicket?: boolean
}>()
</script>

<template>
  <UiEmptyState v-if="!entries.length" message="Aucune activité pour l’instant." />

  <ol v-else class="space-y-5 border-l-2 border-base-300 pl-5">
    <li v-for="entry in entries" :key="entry.id" class="relative space-y-0.5">
      <span class="absolute -left-[1.72rem] top-1 size-3 rounded-full border-2 border-base-100 bg-primary" aria-hidden="true"></span>
      <p class="text-sm">
        <span class="font-semibold">{{ entry.actorName }}</span>
        <template v-if="entry.type === 'created'"> a créé le ticket</template>
        <template v-else-if="entry.type === 'status'"> a changé le statut de {{ STATUS_LABELS[entry.from] }} à {{ STATUS_LABELS[entry.to] }}</template>
        <template v-else-if="entry.type === 'priority'"> a changé la priorité de {{ PRIORITY_LABELS[entry.from] }} à {{ PRIORITY_LABELS[entry.to] }}</template>
        <template v-else> a affecté le ticket à {{ entry.to }}</template>
      </p>
      <NuxtLink v-if="showTicket && entry.ticketTitle" :to="`/tickets/${entry.ticketId}`" class="link block text-sm break-words">
        {{ entry.ticketTitle }}
      </NuxtLink>
      <p class="text-xs text-base-content/75">
        <NuxtTime :datetime="entry.createdAt" locale="fr-FR" date-style="short" time-style="short" />
      </p>
    </li>
  </ol>
</template>
