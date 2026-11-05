<script setup lang="ts">
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'

definePageMeta({ layout:'auth' })
useHead({title:'Connexion'})

const { $auth } = useNuxtApp()
const pending = ref(false)
const error = ref('')

const AUTH_ERRORS: Record<string, string> = {
  'auth/too-many-requests': 'Trop de tentatives. Réessayer dans quelques minutes.',
  'auth/network-request-failed': 'Serveur injoignable. Vérifiez votre connexion.'
}

async function login(email:string, password: string) {
  pending.value = true
  error.value = ''
  try {
    await signInWithEmailAndPassword($auth, email, password)
    await navigateTo('/dashboard')
  } catch (e) {
    error.value = (e instanceof FirebaseError && AUTH_ERRORS[e.code]) || 'Adresse e-mail ou mot de passe incorrect.'
  } finally {
    pending.value = false
  }
}

</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold">Connexion</h1>
      <p class="text-base-content/75">Accédez au suivi de vos demandes d’assistance.</p>
    </div>

    <AuthLoginForm :pending="pending" :error="error" @submit="login" />

  </div>
</template>
