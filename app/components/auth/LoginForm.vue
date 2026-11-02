<script setup lang="ts">
defineProps<{
  pending?: boolean
  /** Ex. : identifiants incorrects, erreur réseau. */
  error?: string
}>()
</script>

<template>
  <form class="space-y-2" @submit.prevent>
    <div v-if="error" role="alert" class="alert alert-error">{{ error }}</div>

    <div class="fieldset">
      <label for="login-email" class="fieldset-legend">Adresse e-mail</label>
      <input id="login-email" name="email" type="email" class="input w-full" autocomplete="email" required />
    </div>

    <div class="fieldset">
      <label for="login-password" class="fieldset-legend">Mot de passe</label>
      <input id="login-password" name="password" type="password" class="input w-full" autocomplete="current-password" required />
    </div>

    <button type="submit" class="btn btn-primary mt-4 w-full" :disabled="pending">
      <span v-if="pending" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
      {{ pending ? 'Connexion…' : 'Se connecter' }}
    </button>
  </form>
</template>
