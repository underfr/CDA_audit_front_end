<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div class="rounded-box border border-dashed border-base-300 p-6 text-center">
    <p class="text-base-content/75">{{ message }}</p>
    <div v-if="$slots.default" class="mt-3">
      <slot />
    </div>
  </div>
</template>
