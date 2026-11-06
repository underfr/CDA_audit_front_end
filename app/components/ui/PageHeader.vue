<script setup lang="ts">
/**
 * @file Page header: optional breadcrumb trail, main heading, subtitle and actions.
 *
 * @slot actions - Optional buttons or links displayed next to the title.
 */

import type { Breadcrumb } from '~/types'

defineProps<{
  /** Main heading (`h1`) of the page. */
  title: string
  /** Optional text displayed under the title. */
  subtitle?: string
  /** Optional breadcrumb trail, from the top level to the current page. */
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
