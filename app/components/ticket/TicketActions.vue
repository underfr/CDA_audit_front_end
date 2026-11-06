<script setup lang="ts">
/**
 * @file Actions available on a ticket: status changes and, for managers, assignment and priority.
 * It only emits the choices: the parent page applies them.
 */

import type { StatusTransition, TicketPriority, UserProfile, TicketStatus } from '~/types'

const props = defineProps<{
  /** Status changes offered to the user. */
  transitions: StatusTransition[]
  /** Shows the assignment and priority forms. */
  canManage?: boolean
  /** Technicians offered for assignment. */
  technicians: UserProfile[]
  /** Id of the assigned technician, or `null` while unassigned. */
  assigneeId: string | null
  /** Current priority of the ticket. */
  priority: TicketPriority
  /** Disables the buttons while an action is running. */
  pending?: boolean
}>()

const emit = defineEmits<{
  /** Emitted when a status change is chosen. */
  status: [status: TicketStatus]
  /** Emitted when the assignment form is submitted. */
  assign: [technicianId: string]
  /** Emitted when the priority form is submitted. */
  priority: [priority: TicketPriority]
}>()

/** Technician selected in the form; follows the `assigneeId` prop when it changes. */
const selectedAssignee = ref(props.assigneeId ?? '')
/** Priority selected in the form; follows the `priority` prop when it changes. */
const selectedPriority = ref(props.priority)
watch(() => props.assigneeId, (value) => { selectedAssignee.value = value ?? '' })
watch(() => props.priority, (value) => { selectedPriority.value = value })
</script>

<template>
  <div class="space-y-6">
    <div v-if="transitions.length" class="space-y-2">
      <h3 class="text-sm font-semibold">Statut</h3>
      <div class="flex flex-wrap gap-2">
        <button
            v-for="transition in transitions"
            :key="transition.to"
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="pending"
            @click="emit('status', transition.to)"
        >
          {{ transition.label }}
        </button>
      </div>
    </div>
    <template v-if="canManage">

    <form class="space-y-2" @submit.prevent="emit('assign', selectedAssignee)">
      <label for="ticket-assignee" class="block text-sm font-semibold">Technicien affecté</label>
      <div class="join w-full">
        <select id="ticket-assignee" v-model="selectedAssignee" class="select join-item w-full">
          <option value="" disabled>Choisir un technicien</option>
          <option v-for="technician in technicians" :key="technician.id" :value="technician.id">
            {{ technician.displayName }}
          </option>
        </select>
        <button type="submit" class="btn join-item" :disabled="pending || !selectedAssignee || selectedAssignee === assigneeId">
          Affecter
        </button>
      </div>
    </form>

    <form class="space-y-2" @submit.prevent="emit('priority', selectedPriority)">
      <label for="ticket-priority" class="block text-sm font-semibold">Priorité</label>
      <div class="join w-full">
        <select id="ticket-priority" v-model="selectedPriority" class="select join-item w-full">
          <option v-for="(label, value) in PRIORITY_LABELS" :key="value" :value="value">{{ label }}</option>
        </select>
        <button type="submit" class="btn join-item" :disabled="pending || selectedPriority === priority">
          Modifier
        </button>
      </div>
    </form>
    </template>
  </div>

</template>