<script setup lang="ts">
import type { BarItem } from '~/types'

defineProps<{
  items: BarItem[]
  max: number
}>()
</script>

<template>
  <ul class="space-y-4">
    <li v-for="item in items" :key="item.label">
      <div class="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span class="font-medium">{{ item.label }}</span>
        <span class="text-base-content/75">{{ item.value }}</span>
      </div>
      <progress class="progress progress-primary w-full" :value="item.value" :max="max" :aria-label="item.label"></progress>
    </li>
  </ul>
</template>
