/**
 * @file French display labels of the enumerated values of the data model.
 */

import type { Role, TicketPriority, TicketStatus } from '~/types'

/** Display label of each ticket status, in lifecycle order. */
export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'Nouveau',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Clôturé',
}

/** Display label of each ticket priority, from lowest to highest. */
export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
  urgent: 'Urgente',
}

/** Display label of each user role. */
export const ROLE_LABELS: Record<Role, string> = {
  collaborator: 'Collaborateur',
  technician: 'Technicien',
  manager: 'Responsable du support',
  admin: 'Administrateur',
}
