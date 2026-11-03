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
          <li
            v-for="category in categories"
            :key="category.id"
            class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-3"
          >
            <span class="font-medium">{{ category.name }}</span>

            <span
              class="badge badge-sm justify-self-center"
              :class="category.active ? 'badge-success' : 'badge-ghost'"
            >
              {{ category.active ? 'Actif' : 'Inactif' }}
            </span>

            <div class="flex items-center justify-end gap-1">
              <button type="button" class="btn btn-ghost btn-sm">
                {{ category.active ? 'Désactiver' : 'Réactiver' }}
                <span class="sr-only">la catégorie {{ category.name }}</span>
              </button>

              <button type="button" class="btn btn-square btn-ghost btn-sm" aria-label="Supprimer la catégorie">
                <AppIcon name="trash" />
              </button>
            </div>
          </li>
        </ul>
      </UiPanel>
    </div>
  </div>
</template>