// Modèle de données (voir le cadrage)

export type Role = 'collaborator' | 'technician' | 'manager' | 'admin'

export type TicketStatus = 'new' | 'in_progress' | 'resolved' | 'closed'

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface UserProfile {
  id: string
  displayName: string
  email: string
  role: Role
  active: boolean
}

export interface Category {
  id: string
  name: string
  active: boolean
}

export interface Ticket {
  id: string
  title: string
  description: string
  categoryId: string
  categoryName: string
  priority: TicketPriority
  status: TicketStatus
  authorId: string
  authorName: string
  assigneeId: string | null
  assigneeName: string | null
  createdAt: Date
  updatedAt: Date
}

export interface TicketComment {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  body: string
  createdAt: Date
}

interface HistoryBase {
  id: string
  ticketId: string
  /** Renseigné quand l'entrée est affichée hors du ticket (flux d'activité). */
  ticketTitle?: string
  actorName: string
  createdAt: Date
}

export type HistoryEntry = HistoryBase & (
  | { type: 'created' }
  | { type: 'status', from: TicketStatus, to: TicketStatus }
  | { type: 'priority', from: TicketPriority, to: TicketPriority }
  | { type: 'assignment', from: string | null, to: string }
)

// Interface

export type IconName = 'dashboard' | 'ticket' | 'chart' | 'users' | 'tag' | 'plus' | 'logout' | 'menu'

export interface NavItem {
  label: string
  to: string
  icon: IconName
}

export interface Breadcrumb {
  label: string
  to?: string
}

export interface StatItem {
  label: string
  value: number | string
  hint?: string
}

export interface BarItem {
  label: string
  value: number
}

export interface StatusTransition {
  to: TicketStatus
  label: string
}

export type TicketFormErrors = Partial<Record<'title' | 'description' | 'categoryId' | 'priority' | 'attachment', string>>

export type RegisterFormErrors = Partial<Record<'displayName' | 'email' | 'password' | 'passwordConfirm', string>>
