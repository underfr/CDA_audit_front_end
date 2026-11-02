<script setup lang="ts">
import { activeCategories } from '~/fixtures/testData'

useHead({ title: 'Nouveau ticket' })
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Déclarer un incident"
      subtitle="Décrivez le problème rencontré, le support le prendra en charge au plus vite."
      :breadcrumbs="[{ label: 'Tickets', to: '/tickets' }, { label: 'Nouveau ticket' }]"
    />

    <div class="grid items-start gap-6 xl:grid-cols-3">
      <UiPanel title="Votre demande" class="xl:col-span-2">
        <TicketForm :categories="activeCategories" />
      </UiPanel>

      <UiPanel title="Pour un traitement rapide">
        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li>Un titre précis, par exemple « VPN : authentification refusée ».</li>
          <li>Le message d’erreur exact, recopié tel quel.</li>
          <li>Le numéro de votre poste ou de votre matériel.</li>
          <li>Ce que vous avez déjà essayé.</li>
        </ul>
      </UiPanel>
    </div>
  </div>
</template>
