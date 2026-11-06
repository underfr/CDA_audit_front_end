<script setup lang="ts">
/**
 * @file Badge showing the status of a ticket.
 */

import type { TicketStatus } from '~/types'

defineProps<{
  /** Status to display. */
  status: TicketStatus
}>()

/** DaisyUI class of the badge for each status. */
const badgeClasses: Record<TicketStatus, string> = {
  new: 'badge-neutral',
  in_progress: 'badge-primary',
  resolved: 'badge-success',
  closed: '',
}
</script>

<template>
  <span class="badge badge-outline badge-sm whitespace-nowrap w-17" :class="badgeClasses[status]">{{ STATUS_LABELS[status] }}</span>
</template>
