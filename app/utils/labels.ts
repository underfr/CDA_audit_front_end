import type { Role, TicketPriority, TicketStatus } from '~/types'

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'Nouveau',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Clôturé',
}

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
  urgent: 'Urgente',
}

export const ROLE_LABELS: Record<Role, string> = {
  collaborator: 'Collaborateur',
  technician: 'Technicien',
  manager: 'Responsable du support',
  admin: 'Administrateur',
}
