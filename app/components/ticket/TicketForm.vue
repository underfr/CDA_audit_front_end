<script setup lang="ts">
import type { Category, TicketFormErrors } from '~/types'

withDefaults(defineProps<{
  /** Catégories actives uniquement. */
  categories: Category[]
  errors?: TicketFormErrors
  pending?: boolean
  /** Erreur globale (réseau, refus de Firebase). */
  error?: string
}>(), { errors: () => ({}) })
</script>

<template>
  <form class="space-y-2" @submit.prevent>
    <p class="text-sm text-base-content/75">Les champs marqués d’un astérisque (*) sont obligatoires.</p>

    <div v-if="error" role="alert" class="alert alert-error">{{ error }}</div>

    <div class="fieldset">
      <label for="ticket-title" class="fieldset-legend">Titre de l’incident <span class="text-error" aria-hidden="true">*</span></label>
      <input
        id="ticket-title"
        name="title"
        type="text"
        class="input w-full"
        :class="{ 'input-error': errors.title }"
        placeholder="Ex. : Impossible de me connecter au VPN"
        minlength="5"
        maxlength="120"
        required
        :aria-invalid="errors.title ? 'true' : undefined"
        :aria-describedby="errors.title ? 'ticket-title-hint ticket-title-error' : 'ticket-title-hint'"
      />
      <p id="ticket-title-hint" class="text-sm text-base-content/75">Entre 5 et 120 caractères.</p>
      <p v-if="errors.title" id="ticket-title-error" class="text-sm text-error">{{ errors.title }}</p>
    </div>

    <div class="fieldset">
      <label for="ticket-category" class="fieldset-legend">Catégorie <span class="text-error" aria-hidden="true">*</span></label>
      <select
        id="ticket-category"
        name="categoryId"
        class="select w-full"
        :class="{ 'select-error': errors.categoryId }"
        required
        :aria-invalid="errors.categoryId ? 'true' : undefined"
        :aria-describedby="errors.categoryId ? 'ticket-category-error' : undefined"
      >
        <option value="">Choisir une catégorie</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
      </select>
      <p v-if="errors.categoryId" id="ticket-category-error" class="text-sm text-error">{{ errors.categoryId }}</p>
    </div>

    <fieldset class="fieldset" :aria-describedby="errors.priority ? 'ticket-priority-error' : undefined">
      <legend class="fieldset-legend">Priorité <span class="text-error" aria-hidden="true">*</span></legend>
      <div class="join join-vertical w-full sm:join-horizontal">
        <input
          v-for="(label, value) in PRIORITY_LABELS"
          :key="value"
          type="radio"
          name="priority"
          class="join-item btn flex-1"
          :value="value"
          :aria-label="label"
          :checked="value === 'medium'"
          required
        />
      </div>
      <p v-if="errors.priority" id="ticket-priority-error" class="text-sm text-error">{{ errors.priority }}</p>
    </fieldset>

    <div class="fieldset">
      <label for="ticket-description" class="fieldset-legend">Description détaillée <span class="text-error" aria-hidden="true">*</span></label>
      <textarea
        id="ticket-description"
        name="description"
        class="textarea w-full"
        :class="{ 'textarea-error': errors.description }"
        rows="6"
        placeholder="Décrivez les étapes pour reproduire le problème et les messages d’erreur affichés."
        minlength="10"
        maxlength="2000"
        required
        :aria-invalid="errors.description ? 'true' : undefined"
        :aria-describedby="errors.description ? 'ticket-description-hint ticket-description-error' : 'ticket-description-hint'"
      ></textarea>
      <p id="ticket-description-hint" class="text-sm text-base-content/75">Entre 10 et 2 000 caractères, texte brut.</p>
      <p v-if="errors.description" id="ticket-description-error" class="text-sm text-error">{{ errors.description }}</p>
    </div>

    <div class="flex flex-wrap justify-end gap-2 border-t border-base-300 pt-4">
      <NuxtLink to="/dashboard" class="btn btn-ghost">Annuler</NuxtLink>
      <button type="submit" class="btn btn-primary" :disabled="pending">
        <span v-if="pending" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
        {{ pending ? 'Envoi en cours…' : 'Envoyer le ticket' }}
      </button>
    </div>
  </form>
</template>
