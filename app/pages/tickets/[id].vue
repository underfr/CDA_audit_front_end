<script setup lang="ts">
import { technicians, ticketComments, ticketDetail as ticket, ticketHistory, ticketTransitions } from '~/fixtures/testData'

useHead({ title: `Ticket #${ticket.id}` })
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-3">
      <UiPageHeader :title="ticket.title" :breadcrumbs="[{ label: 'Tickets', to: '/tickets' }, { label: `Ticket #${ticket.id}` }]" />
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <TicketStatusBadge :status="ticket.status" />
        <TicketPriorityBadge :priority="ticket.priority" />
        <span class="text-base-content/75">
          Déclaré par {{ ticket.authorName }} le
          <NuxtTime :datetime="ticket.createdAt" locale="fr-FR" date-style="long" time-style="short" />
        </span>
      </div>
    </div>

    <div class="grid items-start gap-6 xl:grid-cols-3">
      <div class="min-w-0 space-y-6 xl:col-span-2">
        <UiPanel title="Description">
          <p class="whitespace-pre-line wrap-break-words">{{ ticket.description }}</p>
        </UiPanel>

        <UiPanel title="Commentaires">
          <TicketCommentList :comments="ticketComments" />
          <TicketCommentForm />
        </UiPanel>
      </div>

      <div class="min-w-0 space-y-6">
        <UiPanel title="Informations">
          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-base-content/75">N°</dt>
            <dd class="font-mono">#{{ ticket.id }}</dd>
            <dt class="text-base-content/75">Catégorie</dt>
            <dd>{{ ticket.categoryName }}</dd>
            <dt class="text-base-content/75">Demandeur</dt>
            <dd>{{ ticket.authorName }}</dd>
            <dt class="text-base-content/75">Technicien</dt>
            <dd>{{ ticket.assigneeName ?? 'Non assigné' }}</dd>
            <dt class="text-base-content/75">Mis à jour</dt>
            <dd><NuxtTime :datetime="ticket.updatedAt" locale="fr-FR" date-style="short" time-style="short" /></dd>
          </dl>
        </UiPanel>

        <UiPanel title="Actions">
          <TicketActions
            :transitions="ticketTransitions"
            :technicians="technicians"
            :assignee-id="ticket.assigneeId"
            :priority="ticket.priority"
          />
        </UiPanel>

        <UiPanel title="Historique">
          <TicketHistory :entries="ticketHistory" />
        </UiPanel>
      </div>
    </div>
  </div>
</template>
