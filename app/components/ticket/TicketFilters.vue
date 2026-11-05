<script setup lang="ts">
import type { Category, TicketPriority, TicketStatus } from '~/types'

defineProps<{ categories: Pick<Category, 'id' | 'name'>[] }>()

const search = defineModel<string>('search', { required: true })
const status = defineModel<TicketStatus | ''>('status', { required: true })
const priority = defineModel<TicketPriority | ''>('priority', { required: true })
const categoryId = defineModel<string>('categoryId', { required: true })

function reset() {
  search.value = ''
  status.value = ''
  priority.value = ''
  categoryId.value = ''
}
</script>

<template>
  <form
      role="search"
      aria-label="Filtrer les tickets"
      class="rounded-box border border-base-300 bg-base-100 p-4"
      @submit.prevent
      @reset.prevent="reset"
  >
    <div class="grid gap-x-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="fieldset">
        <label for="filter-search" class="fieldset-legend">Rechercher</label>
        <input id="filter-search" v-model="search" name="search" type="search" class="input w-full" placeholder="Titre ou n° de ticket" />
      </div>

      <div class="fieldset">
        <label for="filter-status" class="fieldset-legend">Statut</label>
        <select id="filter-status" v-model="status" name="status" class="select w-full">
          <option value="">Tous les statuts</option>
          <option v-for="(label, value) in STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>

      <div class="fieldset">
        <label for="filter-priority" class="fieldset-legend">Priorité</label>
        <select id="filter-priority" v-model="priority" name="priority" class="select w-full">
          <option value="">Toutes les priorités</option>
          <option v-for="(label, value) in PRIORITY_LABELS" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>

      <div class="fieldset">
        <label for="filter-category" class="fieldset-legend">Catégorie</label>
        <select id="filter-category" v-model="categoryId" name="categoryId" class="select w-full">
          <option value="">Toutes les catégories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </div>
    </div>

    <div class="mt-2 flex justify-end">
      <button type="reset" class="btn btn-ghost btn-sm">Réinitialiser les filtres</button>
    </div>
  </form>
</template>