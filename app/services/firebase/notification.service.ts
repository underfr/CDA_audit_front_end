import { onValue, ref as dbRef, set } from 'firebase/database'
import type { Database } from 'firebase/database'
import type { AppNotification, UserProfile } from '../../types'

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  critical: 'Critique',
}

function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status
}

function priorityLabel(priority: string) {
  return PRIORITY_LABELS[priority] ?? priority
}

// Un utilisateur a-t-il le droit de voir ce ticket ?
function canSeeTicket(user: UserProfile, ticket: any) {
  if (user.role === 'admin' || user.role === 'manager') {
    return true
  }
  if (user.role === 'technician') {
    return ticket.authorId === user.id || ticket.assigneeId === user.id
  }
  if (user.role === 'collaborator') {
    return ticket.authorId === user.id
  }
  return false
}

// Transforme un événement de l'historique en notification
function historyToNotification(ticketId: string, ticketTitle: string, eventId: string, event: any): AppNotification {
  let title = 'Mise à jour : ' + ticketTitle
  let message = event.actorName + ' a modifié le ticket.'

  if (event.type === 'status') {
    title = 'Avancement : ' + ticketTitle
    message = event.actorName + ' a passé le ticket de « ' + statusLabel(event.from) + ' » à « ' + statusLabel(event.to) + ' ».'
  } else if (event.type === 'assign' || event.type === 'assignee' || event.type === 'assignment') {
    title = 'Affectation : ' + ticketTitle
    message = event.actorName + ' a affecté le ticket à ' + (event.to ?? event.assigneeName ?? 'un technicien') + '.'
  } else if (event.type === 'priority') {
    title = 'Priorité : ' + ticketTitle
    message = event.actorName + ' a changé la priorité de « ' + priorityLabel(event.from) + ' » à « ' + priorityLabel(event.to) + ' ».'
  }

  return {
    id: 'history-' + eventId,
    ticketId,
    title,
    message,
    createdAt: event.createdAt,
  }
}

// Construit la liste des notifications à partir des données Firebase
function buildNotifications(user: UserProfile, tickets: any, comments: any, history: any): AppNotification[] {
  const result: AppNotification[] = []

  for (const ticketId in tickets) {
    const ticket = tickets[ticketId]

    if (!canSeeTicket(user, ticket)) continue

    // Commentaires du ticket
    const ticketComments = comments[ticketId] ?? {}
    for (const commentId in ticketComments) {
      const comment = ticketComments[commentId]
      result.push({
        id: 'comment-' + commentId,
        ticketId,
        title: 'Nouveau commentaire : ' + ticket.title,
        message: comment.authorName + ' a commenté : ' + comment.body,
        createdAt: comment.createdAt,
      })
    }

    // Événements de l'historique (statut, affectation, priorité...)
    const ticketHistory = history[ticketId] ?? {}
    for (const eventId in ticketHistory) {
      result.push(historyToNotification(ticketId, ticket.title, eventId, ticketHistory[eventId]))
    }
  }

  // Les plus récentes en premier
  result.sort((a, b) => b.createdAt - a.createdAt)

  return result
}

// Écoute en temps réel les tickets, commentaires et historique.
// Renvoie une fonction pour arrêter l'écoute.
export function listenNotifications(
  db: Database,
  user: UserProfile,
  onChange: (list: AppNotification[]) => void,
): () => void {
  let tickets: any = {}
  let comments: any = {}
  let history: any = {}
  let ticketsLoaded = false
  let commentsLoaded = false
  let historyLoaded = false

  // On attend d'avoir reçu les 3 sources avant d'envoyer la liste
  function rebuild() {
    if (!ticketsLoaded || !commentsLoaded || !historyLoaded) return
    onChange(buildNotifications(user, tickets, comments, history))
  }

  const stopTickets = onValue(dbRef(db, 'tickets'), (snap) => {
    tickets = snap.val() ?? {}
    ticketsLoaded = true
    rebuild()
  })
  const stopComments = onValue(dbRef(db, 'comments'), (snap) => {
    comments = snap.val() ?? {}
    commentsLoaded = true
    rebuild()
  })
  const stopHistory = onValue(dbRef(db, 'history'), (snap) => {
    history = snap.val() ?? {}
    historyLoaded = true
    rebuild()
  })

  return () => {
    stopTickets()
    stopComments()
    stopHistory()
  }
}

// Écoute en temps réel ce que l'utilisateur a déjà lu :
// - lastRead : la date du dernier « Tout marquer comme lu »
// - readIds : les notifications lues une par une
export function listenReadState(
  db: Database,
  userId: string,
  onChange: (lastRead: number, readIds: Record<string, boolean>) => void,
): () => void {
  let lastRead = 0
  let readIds: Record<string, boolean> = {}
  let lastReadLoaded = false
  let readIdsLoaded = false

  function send() {
    if (!lastReadLoaded || !readIdsLoaded) return
    onChange(lastRead, readIds)
  }

  const stopLastRead = onValue(dbRef(db, 'notificationsLastRead/' + userId), (snap) => {
    lastRead = snap.val() ?? 0
    lastReadLoaded = true
    send()
  })
  const stopReadIds = onValue(dbRef(db, 'notificationsRead/' + userId), (snap) => {
    readIds = snap.val() ?? {}
    readIdsLoaded = true
    send()
  })

  return () => {
    stopLastRead()
    stopReadIds()
  }
}

// Une notification est non lue si elle est plus récente que le dernier
// « Tout marquer comme lu » et qu'elle n'a pas été lue individuellement
export function isNotificationUnread(
  notification: AppNotification,
  lastRead: number,
  readIds: Record<string, boolean>,
): boolean {
  return notification.createdAt > lastRead && !readIds[notification.id]
}

// Marque une seule notification comme lue
export async function markAsRead(db: Database, userId: string, notificationId: string): Promise<void> {
  await set(dbRef(db, 'notificationsRead/' + userId + '/' + notificationId), true)
}

// Marque toutes les notifications comme lues
export async function markAllAsRead(db: Database, userId: string): Promise<void> {
  await set(dbRef(db, 'notificationsLastRead/' + userId), Date.now())
}