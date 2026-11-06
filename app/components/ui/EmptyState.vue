<script setup lang="ts">
/**
 * @file Placeholder displayed when a list has nothing to show.
 *
 * @slot default - Optional action displayed under the message.
 */

defineProps<{
  /** Text explaining why there is nothing to show. */
  message: string
}>()
</script>

<template>
  <div class="rounded-box border border-dashed border-base-300 p-6 text-center">
    <p class="text-base-content/75">{{ message }}</p>
    <div v-if="$slots.default" class="mt-3">
      <slot />
    </div>
  </div>
</template>
