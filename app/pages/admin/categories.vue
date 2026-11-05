<script setup lang="ts">
import { CategoryService } from '~/services/firebase/category.service'
import type { Category } from '~/types'

definePageMeta({ roles: ['admin'] })
useHead({ title: 'Catégories' })

const service = new CategoryService()

const categories = ref<Category[]>([])
let stopListening: (() => void) | null = null

onMounted(() => {
  stopListening = service.list((list) => {
    categories.value = list.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  })
})

onUnmounted(() => {
  if (stopListening) stopListening()
})

// Ajout
const newName = useDraft('category', '')
const creating = ref(false)
const createError = ref('')

async function submit() {
  createError.value = ''

  const name = newName.value.trim()
  if (!name) return

  // On vérifie que le nom n'existe pas déjà (sans tenir compte des majuscules)
  const exists = categories.value.some((c) => c.name.toLowerCase() === name.toLowerCase())
  if (exists) {
    createError.value = 'Cette catégorie existe déjà.'
    return
  }

  creating.value = true
  try {
    await service.create({ name, active: true })
    newName.value = ''
  } catch {
    createError.value = 'La création de la catégorie a échoué. Réessayez.'
  } finally {
    creating.value = false
  }
}

// Activation / désactivation
const toggleError = ref('')

async function toggleActive(category: Category) {
  toggleError.value = ''
  try {
    await service.setActive(category.id, !category.active)
  } catch {
    toggleError.value = `La modification de « ${category.name} » a échoué.`
  }
}

// Suppression
const categoryToDelete = ref<Category | null>(null)
const deleting = ref(false)
const deleteError = ref('')

function askDelete(category: Category) {
  deleteError.value = ''
  categoryToDelete.value = category
}

async function confirmDelete() {
  const target = categoryToDelete.value
  if (!target) return
  deleting.value = true
  try {
    await service.delete(target.id)
    categoryToDelete.value = null
  } catch (e) {
    // Le service refuse la suppression si des tickets utilisent la catégorie
    deleteError.value = e instanceof Error ? e.message : `La suppression de « ${target.name} » a échoué.`
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Catégories d’incidents"
      subtitle="Une catégorie désactivée n’est plus proposée à la création d’un ticket."
    />

    <div class="grid items-start gap-6 lg:grid-cols-3">
      <UiPanel title="Ajouter une catégorie">
        <form class="space-y-2" @submit.prevent="submit">
          <label for="category-name" class="block text-sm font-semibold">Nom de la catégorie</label>
          <input
            id="category-name"
            v-model="newName"
            name="name"
            type="text"
            class="input w-full"
            maxlength="50"
            required
          />

          <div v-if="createError" role="alert" class="alert alert-error">{{ createError }}</div>

          <button type="submit" class="btn btn-primary w-full" :disabled="creating">
            <span v-if="creating" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
            Ajouter
          </button>
        </form>
      </UiPanel>

      <UiPanel title="Catégories existantes" class="lg:col-span-2">
        <div v-if="toggleError" role="alert" class="alert alert-error mb-2">{{ toggleError }}</div>

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
              <button type="button" class="btn btn-ghost btn-sm" @click="toggleActive(category)">
                {{ category.active ? 'Désactiver' : 'Réactiver' }}
                <span class="sr-only">la catégorie {{ category.name }}</span>
              </button>

              <button
                type="button"
                class="btn btn-square btn-ghost btn-sm"
                :aria-label="`Supprimer la catégorie ${category.name}`"
                @click="askDelete(category)"
              >
                <AppIcon name="trash" />
              </button>
            </div>
          </li>
        </ul>
      </UiPanel>
    </div>

    <dialog
      v-if="categoryToDelete"
      :open="true"
      class="modal"
      aria-labelledby="delete-title"
    >
      <div class="modal-box">
        <h3 id="delete-title" class="text-lg font-bold">Supprimer cette catégorie ?</h3>
        <p class="mt-2 text-sm text-base-content/75">
          La catégorie <span class="font-semibold">{{ categoryToDelete.name }}</span>
          sera supprimée. Cette action est définitive.
        </p>
        <div v-if="deleteError" role="alert" class="alert alert-error mt-4">{{ deleteError }}</div>
        <div class="modal-action">
          <button type="button" class="btn" :disabled="deleting" @click="categoryToDelete = null">Annuler</button>
          <button type="button" class="btn btn-error" :disabled="deleting" @click="confirmDelete">
            <span v-if="deleting" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
            Supprimer
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" :disabled="deleting" @click="categoryToDelete = null">Fermer</button>
      </form>
    </dialog>
  </div>
</template>