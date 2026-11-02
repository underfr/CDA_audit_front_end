<script setup lang="ts">
import type { TicketStatus } from '~/types'

defineProps<{ status: TicketStatus }>()

const badgeClasses: Record<TicketStatus, string> = {
  new: 'badge-neutral',
  in_progress: 'badge-primary',
  resolved: 'badge-success',
  closed: '',
}
</script>

<template>
  <span class="badge badge-outline badge-sm whitespace-nowrap" :class="badgeClasses[status]">{{ STATUS_LABELS[status] }}</span>
</template>
