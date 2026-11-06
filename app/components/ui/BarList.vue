<script setup lang="ts">
/**
 * @file List of labelled progress bars.
 */

import type { BarItem } from '~/types'

defineProps<{
  /** Rows to display, in the given order. */
  items: BarItem[]
  /** Value corresponding to a full bar. */
  max: number
}>()
</script>

<template>
  <ul class="space-y-4 h-60">
    <li v-for="item in items" :key="item.label">
      <div class="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span class="font-medium">{{ item.label }}</span>
        <span class="text-base-content/75">{{ item.value }}</span>
      </div>
      <progress class="progress progress-primary w-full" :value="item.value" :max="max" :aria-label="item.label"></progress>
    </li>
  </ul>
</template>
