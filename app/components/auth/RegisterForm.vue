<script setup lang="ts">
import type { RegisterFormErrors } from '~/types'

withDefaults(defineProps<{
  errors?: RegisterFormErrors
  pending?: boolean
  error?: string
}>(), { errors: () => ({}) })
</script>

<template>
  <form class="space-y-2" @submit.prevent>
    <div v-if="error" role="alert" class="alert alert-error">{{ error }}</div>

    <div class="fieldset">
      <label for="register-name" class="fieldset-legend">Nom complet</label>
      <input
        id="register-name"
        name="displayName"
        type="text"
        class="input w-full"
        :class="{ 'input-error': errors.displayName }"
        autocomplete="name"
        maxlength="80"
        required
        :aria-invalid="errors.displayName ? 'true' : undefined"
        :aria-describedby="errors.displayName ? 'register-name-error' : undefined"
      />
      <p v-if="errors.displayName" id="register-name-error" class="text-sm text-error">{{ errors.displayName }}</p>
    </div>

    <div class="fieldset">
      <label for="register-email" class="fieldset-legend">Adresse e-mail professionnelle</label>
      <input
        id="register-email"
        name="email"
        type="email"
        class="input w-full"
        :class="{ 'input-error': errors.email }"
        autocomplete="email"
        required
        :aria-invalid="errors.email ? 'true' : undefined"
        :aria-describedby="errors.email ? 'register-email-error' : undefined"
      />
      <p v-if="errors.email" id="register-email-error" class="text-sm text-error">{{ errors.email }}</p>
    </div>

    <div class="fieldset">
      <label for="register-password" class="fieldset-legend">Mot de passe</label>
      <input
        id="register-password"
        name="password"
        type="password"
        class="input w-full"
        :class="{ 'input-error': errors.password }"
        autocomplete="new-password"
        minlength="8"
        required
        :aria-invalid="errors.password ? 'true' : undefined"
        :aria-describedby="errors.password ? 'register-password-hint register-password-error' : 'register-password-hint'"
      />
      <p id="register-password-hint" class="text-sm text-base-content/75">8 caractères minimum.</p>
      <p v-if="errors.password" id="register-password-error" class="text-sm text-error">{{ errors.password }}</p>
    </div>

    <div class="fieldset">
      <label for="register-password-confirm" class="fieldset-legend">Confirmer le mot de passe</label>
      <input
        id="register-password-confirm"
        name="passwordConfirm"
        type="password"
        class="input w-full"
        :class="{ 'input-error': errors.passwordConfirm }"
        autocomplete="new-password"
        required
        :aria-invalid="errors.passwordConfirm ? 'true' : undefined"
        :aria-describedby="errors.passwordConfirm ? 'register-password-confirm-error' : undefined"
      />
      <p v-if="errors.passwordConfirm" id="register-password-confirm-error" class="text-sm text-error">{{ errors.passwordConfirm }}</p>
    </div>

    <button type="submit" class="btn btn-primary mt-4 w-full" :disabled="pending">
      <span v-if="pending" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
      {{ pending ? 'Création du compte…' : 'Créer mon compte' }}
    </button>
  </form>
</template>
