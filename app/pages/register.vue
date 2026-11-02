<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Créer un compte' })
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold">Créer un compte</h1>
      <p class="text-base-content/75">Votre compte vous permet de déclarer et de suivre vos incidents.</p>
    </div>

    <AuthRegisterForm />

    <p class="text-center text-sm">
      Déjà inscrit ?
      <NuxtLink to="/login" class="link link-primary">Se connecter</NuxtLink>
    </p>
  </div>
</template>
