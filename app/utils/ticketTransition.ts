import type { StatusTransition, Ticket, UserProfile } from '~/types'

/**
 * Transitions de statut proposées à l'utilisateur pour ce ticket.
 * Les règles de sécurité doivent appliquer la même table.
 *
 * @param ticket - le ticket affiché.
 * @param user - l'utilisateur connecté.
 * @returns les boutons à afficher, ou un tableau vide.
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