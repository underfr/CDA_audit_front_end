<script setup lang="ts">
/**
 * @file Card showing a single indicator.
 */

defineProps<{
  /** Name of the indicator. */
  label: string
  /** Value of the indicator, already formatted when it is a string. */
  value: number | string
  /** Optional detail displayed under the value. */
  hint?: string
}>()
</script>

<template>
  <div class="stats w-full border border-base-300 bg-base-100 h-27">
    <div class="stat">
      <div class="stat-title whitespace-normal text-base-content/75">{{ label }}</div>
      <div class="stat-value text-3xl text-primary">{{ value }}</div>
      <div v-if="hint" class="stat-desc whitespace-normal text-base-content/75">{{ hint }}</div>
    </div>
  </div>
</template>
