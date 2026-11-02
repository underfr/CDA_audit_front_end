<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  hint?: string
}>()
</script>

<template>
  <div class="stats w-full border border-base-300 bg-base-100">
    <div class="stat">
      <div class="stat-title whitespace-normal text-base-content/75">{{ label }}</div>
      <div class="stat-value text-3xl text-primary">{{ value }}</div>
      <div v-if="hint" class="stat-desc whitespace-normal text-base-content/75">{{ hint }}</div>
    </div>
  </div>
</template>
