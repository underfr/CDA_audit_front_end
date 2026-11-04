<script setup lang="ts">
import { TicketService } from '~/services/firebase/ticket.service'
import type { HistoryEntry, Ticket, TicketPriority, UserProfile } from '~/types'

const route = useRoute()
const profile = useProfile()
const ticketService = new TicketService()
const id = String(route.params.id)
const transitions = computed(()=>ticket.value ? getTransitions(ticket.value, profile.value!): [])

const ticket = ref<Ticket | null>(null)
const pending = ref(true)
const history = ref<HistoryEntry[]>([])
const comments = ref<TicketComment[]>([])
const stopComments = ticketService.watchComments(id,(list)=>{ comments.value = list})
const stopListening = ticketService.watchById(
    id,
    (value) => { ticket.value = value; pending.value = false },
    () => { ticket.value = null; pending.value = false },
)
const stopHistory = ticketService.watchHistory(id, (entries) => { history.value = entries })
onUnmounted(() => { stopListening(); stopHistory(); stopComments() })

useHead({ title: () => ticket.value?.title ?? 'Ticket' })

const isManager = profile.value?.role === 'manager' || profile.value?.role === 'admin'
const technicians = isManager ? useTechnicians() : ref<UserProfile[]>([])

const actionPending = ref(false)
const actionError = ref('')
const commentBody = ref('')
const commentPending = ref(false)
const commentError = ref('')

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
function onStatus(status: TicketStatus) {
  runAction(() => ticketService.updateStatus(ticket.value!, status, profile.value!))
}
function onAssign(technicianId: string) {
  const technician = technicians.value.find((t) => t.id === technicianId)
  if (technician) runAction(() => ticketService.assign(ticket.value!, technician, profile.value!))
}

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