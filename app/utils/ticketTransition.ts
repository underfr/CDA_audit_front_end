/**
 * @file Business rules of the ticket status lifecycle, on the interface side.
 */

import type { StatusTransition, Ticket, UserProfile } from '~/types'

/**
 * Lists the status transitions offered to a user on a ticket.
 * The assignee moves it from `new` to `in_progress` then to `resolved`; the author then confirms
 * the resolution or reopens it. The security rules must enforce the same table.
 *
 * @param ticket - Displayed ticket.
 * @param user - Signed-in user.
 * @returns The buttons to display, or an empty array.
 */
export function getTransitions(ticket: Ticket, user: UserProfile): StatusTransition[] {
    const isAssignee = ticket.assigneeId === user.id
    const isAuthor = ticket.authorId === user.id

    switch (ticket.status) {
        case 'new':
            return isAssignee ? [{ to: 'in_progress', label: 'Prendre en charge' }] : []
        case 'in_progress':
            return isAssignee ? [{ to: 'resolved', label: 'Marquer comme résolu' }] : []
        case 'resolved':
            return isAuthor
                ? [{ to: 'closed', label: 'Confirmer la résolution' }, { to: 'in_progress', label: 'Le problème persiste' }]
                : []
        default:
            return []
    }
}