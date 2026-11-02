<script setup lang="ts">
import type { StatusTransition, TicketPriority, UserProfile } from '~/types'

defineProps<{
  /** Transitions autorisées pour l'utilisateur et le statut actuel. */
  transitions: StatusTransition[]
  technicians: UserProfile[]
  assigneeId: string | null
  priority: TicketPriority
}>()
</script>

<template>
  <div class="space-y-6">
    <div v-if="transitions.length" class="space-y-2">
      <h3 class="text-sm font-semibold">Statut</h3>
      <div class="flex flex-wrap gap-2">
        <button v-for="transition in transitions" :key="transition.to" type="button" class="btn btn-primary btn-sm">
          {{ transition.label }}
        </button>
      </div>
    </div>

    <form class="space-y-2" @submit.prevent>
      <label for="ticket-assignee" class="block text-sm font-semibold">Technicien affecté</label>
      <div class="join w-full">
        <select id="ticket-assignee" name="assigneeId" class="select join-item w-full">
          <option value="" :selected="!assigneeId">Non assigné</option>
          <option v-for="technician in technicians" :key="technician.id" :value="technician.id" :selected="technician.id === assigneeId">
            {{ technician.displayName }}
          </option>
        </select>
        <button type="submit" class="btn join-item">Affecter</button>
      </div>
    </form>

    <form class="space-y-2" @submit.prevent>
      <label for="ticket-priority" class="block text-sm font-semibold">Priorité</label>
      <div class="join w-full">
        <select id="ticket-priority" name="priority" class="select join-item w-full">
          <option v-for="(label, value) in PRIORITY_LABELS" :key="value" :value="value" :selected="value === priority">{{ label }}</option>
        </select>
        <button type="submit" class="btn join-item">Modifier</button>
      </div>
    </form>
  </div>
</template>
