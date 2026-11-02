<script setup lang="ts">
import type { Breadcrumb } from '~/types'

defineProps<{
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
}>()
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0 space-y-1">
      <nav v-if="breadcrumbs" aria-label="Fil d’Ariane" class="breadcrumbs p-0 text-sm">
        <ul>
          <li v-for="crumb in breadcrumbs" :key="crumb.label">
            <NuxtLink v-if="crumb.to" :to="crumb.to">{{ crumb.label }}</NuxtLink>
            <span v-else aria-current="page">{{ crumb.label }}</span>
          </li>
        </ul>
      </nav>
      <h1 class="text-2xl font-bold break-words text-primary sm:text-3xl">{{ title }}</h1>
      <p v-if="subtitle" class="text-base-content/75">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
