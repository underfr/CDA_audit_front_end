<script setup lang="ts">
/**
 * @file Ticket details page (`/tickets/:id`): description, comments, information, history and the
 * actions allowed for the signed-in user. An unknown or forbidden ticket shows an empty state.
 */

import { TicketService } from '~/services/firebase/ticket.service'
import type { HistoryEntry, Ticket, TicketPriority, UserProfile } from '~/types'

const route = useRoute()
/** Profile of the signed-in user. */
const profile = useProfile()
/** Database access for the tickets. */
const ticketService = new TicketService()
/** Id of the displayed ticket, taken from the URL. */
const id = String(route.params.id)
/** Status changes offered to the user on this ticket. */
const transitions = computed(() => ticket.value && profile.value ? getTransitions(ticket.value, profile.value) : [])

/** Displayed ticket, or `null` when it is missing, forbidden or not loaded yet. */
const ticket = ref<Ticket | null>(null)
/** Whether the first load of the ticket is running. */
const pending = ref(true)
/** History of the ticket, newest first. */
const history = ref<HistoryEntry[]>([])
/** Comments of the ticket, oldest first. */
const comments = ref<TicketComment[]>([])
/** Stops listening to the comments. */
const stopComments = ticketService.watchComments(id,(list)=>{ comments.value = list})
/** Stops listening to the ticket. */
const stopListening = ticketService.watchById(
    id,
    (value) => { ticket.value = value; pending.value = false },
    () => { ticket.value = null; pending.value = false },
)
/** Stops listening to the history. */
const stopHistory = ticketService.watchHistory(id, (entries) => { history.value = entries })
onUnmounted(() => { stopListening(); stopHistory(); stopComments() })

useHead({ title: () => ticket.value?.title ?? 'Ticket' })

/** Whether the user is a manager or an admin, who can assign tickets and change their priority. */
const isManager = profile.value?.role === 'manager' || profile.value?.role === 'admin'
/** Technicians offered for assignment; only loaded for managers and admins. */
const technicians = isManager ? useTechnicians() : ref<UserProfile[]>([])

/** Whether a ticket action is running. */
const actionPending = ref(false)
/** Error message of the last ticket action. */
const actionError = ref('')
/** Text of the comment being written, kept as a draft per ticket. */
const commentBody = useDraft(`comment:${id}`, '')
/** Whether a comment is being published. */
const commentPending = ref(false)
/** Error message of the comment form. */
const commentError = ref('')

/**
 * Publishes the typed comment and empties the field.
 * The text is kept and an error message displayed if the publication fails.
 *
 * @returns A promise resolved once the attempt is over; failures are displayed, not thrown.
 */
async function onComment() {
  commentPending.value = true
  commentError.value = ''
  try {
    await ticketService.addComment(id, commentBody.value.trim(), profile.value!)
    commentBody.value = ''
  } catch (error) {
    console.error(error)
    commentError.value = 'Le commentaire n’a pas pu être publié. Réessayez.'
  } finally {
    commentPending.value = false
  }
}
/**
 * Runs a ticket action while managing its pending state and error message.
 *
 * @param action - Action to run.
 * @returns A promise resolved once the attempt is over; failures are displayed, not thrown.
 */
async function runAction(action: () => Promise<void>) {
  actionPending.value = true
  actionError.value = ''
  try {
    await action()
  } catch {
    actionError.value = 'La modification a échoué. Réessayez.'
  } finally {
    actionPending.value = false
  }
}
/**
 * Applies a status change to the ticket.
 *
 * @param status - New status.
 */
function onStatus(status: TicketStatus) {
  runAction(() => ticketService.updateStatus(ticket.value!, status, profile.value!))
}
/**
 * Assigns the ticket to a technician; does nothing if the technician is not in the loaded list.
 *
 * @param technicianId - Id of the selected technician.
 */
function onAssign(technicianId: string) {
  const technician = technicians.value.find((t) => t.id === technicianId)
  if (technician) runAction(() => ticketService.assign(ticket.value!, technician, profile.value!))
}

/**
 * Changes the priority of the ticket.
 *
 * @param priority - New priority.
 */
function onPriority(priority: TicketPriority) {
  runAction(() => ticketService.updatePriority(ticket.value!, priority, profile.value!))
}
</script>

<template>
  <div class="space-y-6">
    <p v-if="pending" role="status" class="flex items-center gap-2 text-base-content/75">
      <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
      Chargement du ticket…
    </p>

    <UiEmptyState v-else-if="!ticket" message="Ce ticket est introuvable ou vous n’y avez pas accès.">
      <NuxtLink to="/tickets" class="btn btn-sm">Retour aux tickets</NuxtLink>
    </UiEmptyState>

    <template v-else>
      <div class="space-y-3">
        <UiPageHeader :title="ticket.title" :breadcrumbs="[{ label: 'Tickets', to: '/tickets' }, { label: `Ticket ${ticketNumber(ticket)}` }]" />
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
            <p class="whitespace-pre-line wrap-break-word">{{ ticket.description }}</p>
          </UiPanel>

          <UiPanel title="Commentaires">
            <TicketCommentList :comments="comments" />
            <TicketCommentForm
                v-if="ticket.status !== 'closed'"
                v-model="commentBody"
                :pending="commentPending"
                :error="commentError"
                @submit="onComment"
            />
          </UiPanel>
        </div>

        <div class="min-w-0 space-y-6">
          <UiPanel title="Informations">
            <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt class="text-base-content/75">N°</dt>
              <dd class="font-mono">{{ ticketNumber(ticket) }}</dd>
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

          <UiPanel v-if="isManager || transitions.length" title="Actions">
            <p v-if="actionError" role="alert" class="alert alert-error mb-4">{{ actionError }}</p>
            <TicketActions
                :transitions="transitions"
                :can-manage="isManager"
                :technicians="technicians"
                :assignee-id="ticket.assigneeId"
                :priority="ticket.priority"
                :pending="actionPending"
                @status="onStatus"
                @assign="onAssign"
                @priority="onPriority"
            />
          </UiPanel>

          <UiPanel title="Historique">
            <TicketHistory :entries="history" />
          </UiPanel>
        </div>
      </div>
    </template>
  </div>
</template>