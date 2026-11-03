<script setup lang="ts">
import { categories } from '~/fixtures/testData'
definePageMeta({roles:["admin"]})
useHead({ title: 'Catégories' })
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Catégories d’incidents"
      subtitle="Une catégorie désactivée n’est plus proposée à la création d’un ticket."
    />

    <div class="grid items-start gap-6 lg:grid-cols-3">
      <UiPanel title="Ajouter une catégorie">
        <form class="space-y-2" @submit.prevent>
          <label for="category-name" class="block text-sm font-semibold">Nom de la catégorie</label>
          <input id="category-name" name="name" type="text" class="input w-full" maxlength="50" required />
          <button type="submit" class="btn btn-primary w-full">Ajouter</button>
        </form>
      </UiPanel>

      <UiPanel title="Catégories existantes" class="lg:col-span-2">
        <ul class="divide-y divide-base-300">
          <li v-for="category in categories" :key="category.id" class="flex flex-wrap items-center justify-between gap-2 py-3">
            <div class="flex items-center gap-3">
              <span class="font-medium">{{ category.name }}</span>
              <span class="badge badge-sm" :class="category.active ? 'badge-success' : 'badge-ghost'">
                {{ category.active ? 'Active' : 'Désactivée' }}
              </span>
            </div>
            <button type="button" class="btn btn-ghost btn-sm">
              {{ category.active ? 'Désactiver' : 'Réactiver' }}
              <span class="sr-only">la catégorie {{ category.name }}</span>
            </button>
          </li>
        </ul>
      </UiPanel>
    </div>
  </div>
</template>
