<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="card border border-base-300 bg-base-100">
    <div class="card-body gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="card-title text-lg">{{ title }}</h2>
        <slot name="actions" />
      </div>
      <slot />
    </div>
  </section>
</template>
