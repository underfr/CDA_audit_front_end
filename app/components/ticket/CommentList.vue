<script setup lang="ts">
import type { TicketComment } from '~/types'

defineProps<{ comments: TicketComment[] }>()
</script>

<template>
  <UiEmptyState v-if="!comments.length" message="Aucun commentaire pour l’instant." />

  <ul v-else class="space-y-4">
    <li v-for="comment in comments" :key="comment.id" class="flex gap-3">
      <div class="avatar avatar-placeholder" aria-hidden="true">
        <div class="size-9 rounded-full bg-base-300">
          <span class="text-sm font-semibold">{{ comment.authorName.charAt(0) }}</span>
        </div>
      </div>
      <div class="min-w-0 flex-1 rounded-box bg-base-200 p-3">
        <p class="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span class="font-semibold">{{ comment.authorName }}</span>
          <NuxtTime :datetime="comment.createdAt" locale="fr-FR" date-style="short" time-style="short" class="text-base-content/75" />
        </p>
        <!-- Texte brut uniquement : jamais de v-html sur un contenu saisi -->
        <p class="mt-1 whitespace-pre-line break-words">{{ comment.body }}</p>
      </div>
    </li>
  </ul>
</template>
