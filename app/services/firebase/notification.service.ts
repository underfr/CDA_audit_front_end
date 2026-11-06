/**
 * @file Notifications derived in real time from the tickets, comments and history of the
 * Realtime Database, and per-user read state (`notificationsLastRead` and `notificationsRead` nodes).
 */

import { onValue, ref as dbRef, set } from 'firebase/database'
import type { Database } from 'firebase/database'
import type { AppNotification, UserProfile } from '~/types'

/** Status labels used in notification messages. */
const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
}

/**
 * Priority labels used in notification messages.
 *
 * @todo Replace `critical` with `urgent`, the key used by the data model: urgent priorities are currently shown with their raw key.
 */
const PRIORITY_LABELS: Record<string, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  critical: 'Critique',
}

/**
 * Translates a status key.
 *
 * @param status - Status key.
 * @returns The label, or the key itself when it is unknown.
 */
function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status
}

/**
 * Translates a priority key.
 *
 * @param priority - Priority key.
 * @returns The label, or the key itself when it is unknown.
 */
function priorityLabel(priority: string) {
  return PRIORITY_LABELS[priority] ?? priority
}

/**
 * Tells whether a user may be notified about a ticket: managers and admins see every ticket,
 * technicians those they authored or are assigned to, and collaborators those they authored.
 *
 * @param user - User to check.
 * @param ticket - Raw ticket read from the database.
 * @returns `true` when the user may see the ticket.
 */
function canSeeTicket(user: UserProfile, ticket: Ticket) {
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

/**
 * Converts a history event into a notification.
 * Unknown event types produce a generic update message.
 *
 * @param ticketId - Id of the ticket concerned.
 * @param ticketTitle - Title of the ticket concerned.
 * @param eventId - Key of the history event.
 * @param event - Raw history event read from the database.
 * @returns The matching notification.
 */
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

/**
 * Builds a user's notifications from the raw Firebase data.
 * Each comment and history event of a visible ticket gives one notification.
 *
 * @param user - User receiving the notifications.
 * @param tickets - Content of the `tickets` node, by ticket id.
 * @param comments - Content of the `comments` node, by ticket id then comment id.
 * @param history - Content of the `history` node, by ticket id then entry id.
 * @returns The notifications, newest first.
 */
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

/**
 * Listens in real time to the tickets, comments and history, and rebuilds the user's notifications.
 * The three nodes are read in full, then filtered on the client.
 *
 * @param db - Realtime Database instance.
 * @param user - User receiving the notifications.
 * @param onChange - Receives the notifications, newest first, on every change.
 * @returns A function that stops listening.
 */
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

  /** Sends the list, but only once the three sources have been received. */
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

/**
 * Listens in real time to what the user has already read.
 *
 * @param db - Realtime Database instance.
 * @param userId - Id of the user.
 * @param onChange - Receives `lastRead`, the time of the last "mark all as read" in milliseconds,
 * and `readIds`, the notifications read one by one.
 * @returns A function that stops listening.
 */
export function listenReadState(
  db: Database,
  userId: string,
  onChange: (lastRead: number, readIds: Record<string, boolean>) => void,
): () => void {
  let lastRead = 0
  let readIds: Record<string, boolean> = {}
  let lastReadLoaded = false
  let readIdsLoaded = false

  /** Sends the read state, but only once both sources have been received. */
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

/**
 * Tells whether a notification is unread: it must be more recent than the last
 * "mark all as read" and must not have been read individually.
 *
 * @param notification - Notification to check.
 * @param lastRead - Time of the last "mark all as read", in milliseconds.
 * @param readIds - Notifications read one by one, by notification id.
 * @returns `true` when the notification is unread.
 */
export function isNotificationUnread(
  notification: AppNotification,
  lastRead: number,
  readIds: Record<string, boolean>,
): boolean {
  return notification.createdAt > lastRead && !readIds[notification.id]
}

/**
 * Marks a single notification as read.
 *
 * @param db - Realtime Database instance.
 * @param userId - Id of the user.
 * @param notificationId - Id of the notification.
 * @returns A promise resolved once the write is complete.
 */
export async function markAsRead(db: Database, userId: string, notificationId: string): Promise<void> {
  await set(dbRef(db, 'notificationsRead/' + userId + '/' + notificationId), true)
}

/**
 * Marks all the notifications as read, by storing the current time of the browser.
 *
 * @param db - Realtime Database instance.
 * @param userId - Id of the user.
 * @returns A promise resolved once the write is complete.
 */
export async function markAllAsRead(db: Database, userId: string): Promise<void> {
  await set(dbRef(db, 'notificationsLastRead/' + userId), Date.now())
}