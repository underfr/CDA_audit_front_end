<script setup lang="ts">
/**
 * @file Badge showing the priority of a ticket.
 */

import type { TicketPriority } from '~/types'

defineProps<{
  /** Priority to display. */
  priority: TicketPriority
}>()

/** DaisyUI class of the badge for each priority. */
const badgeClasses: Record<TicketPriority, string> = {
  low: 'badge-ghost',
  medium: 'badge-info',
  high: 'badge-warning',
  urgent: 'badge-error',
}
</script>

<template>
  <span class="badge badge-sm whitespace-nowrap w-17" :class="badgeClasses[priority]">{{ PRIORITY_LABELS[priority] }}</span>
</template>
