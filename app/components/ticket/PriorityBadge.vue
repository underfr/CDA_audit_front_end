<script setup lang="ts">
import type { TicketPriority } from '~/types'

defineProps<{ priority: TicketPriority }>()

const badgeClasses: Record<TicketPriority, string> = {
  low: 'badge-ghost',
  medium: 'badge-info',
  high: 'badge-warning',
  urgent: 'badge-error',
}
</script>

<template>
  <span class="badge badge-sm whitespace-nowrap" :class="badgeClasses[priority]">{{ PRIORITY_LABELS[priority] }}</span>
</template>
