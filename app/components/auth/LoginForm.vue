<script setup lang="ts">
/**
 * @file Sign-in form. It only collects the credentials: the parent page signs the user in.
 */

defineProps<{
  /** Disables the button and shows a spinner while the sign-in is running. */
  pending?: boolean
  /** Error message displayed above the fields. */
  error?: string
}>()

const emit = defineEmits<{
  /** Emitted on submission, with the typed e-mail address and password. */
  submit: [email: string, password: string]
}>()

/** E-mail address typed by the user. */
const email = ref('')
/** Password typed by the user. */
const password = ref('')
</script>

<template>
  <form class="space-y-2" @submit.prevent="emit('submit', email, password)">
    <div v-if="error" role="alert" class="alert alert-error">{{ error }}</div>

    <div class="fieldset">
      <label for="login-email" class="fieldset-legend">Adresse e-mail</label>
      <input id="login-email" v-model="email" name="email" type="email" class="input w-full" autocomplete="email" required />
    </div>

    <div class="fieldset">
      <label for="login-password" class="fieldset-legend">Mot de passe</label>
      <input id="login-password" v-model="password" name="password" type="password" class="input w-full" autocomplete="current-password" required />
    </div>

    <button type="submit" class="btn btn-primary mt-4 w-full" :disabled="pending">
      <span v-if="pending" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
      {{ pending ? 'Connexion…' : 'Se connecter' }}
    </button>
  </form>
</template>
