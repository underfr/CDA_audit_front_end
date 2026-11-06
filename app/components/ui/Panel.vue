<script setup lang="ts">
/**
 * @file Titled card used to group content on a page.
 *
 * @slot default - Content of the card.
 * @slot actions - Optional links or buttons displayed next to the title.
 */

defineProps<{
  /** Heading (`h2`) of the card. */
  title: string
}>()
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
