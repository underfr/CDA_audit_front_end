<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Connexion' })
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold">Connexion</h1>
      <p class="text-base-content/75">Accédez au suivi de vos demandes d’assistance.</p>
    </div>

    <AuthLoginForm />

    <p class="text-center text-sm">
      Pas encore de compte ?
      <NuxtLink to="/register" class="link link-primary">Créer un compte</NuxtLink>
    </p>
  </div>
</template>
