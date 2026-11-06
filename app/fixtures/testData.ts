/**
 * @file Hard-coded test data for the design phase, to be replaced by the Firebase data.
 * People, addresses and tickets are fictitious.
 */

import type {
  BarItem,
  Category,
  HistoryEntry,
  NavItem,
  StatItem,
  StatusTransition,
  Ticket,
  TicketComment,
  UserProfile,
} from '~/types'

// Users

/** Collaborator used as the signed-in user. */
const marc: UserProfile = { id: 'u-collab-1', displayName: 'Marc Durand', email: 'marc.durand@example.com', role: 'collaborator', active: true }
/** Active collaborator. */
const alice: UserProfile = { id: 'u-collab-2', displayName: 'Alice Martin', email: 'alice.martin@example.com', role: 'collaborator', active: true }
/** Active collaborator. */
const thomas: UserProfile = { id: 'u-collab-3', displayName: 'Thomas Petit', email: 'thomas.petit@example.com', role: 'collaborator', active: true }
/** Disabled collaborator. */
const claire: UserProfile = { id: 'u-collab-4', displayName: 'Claire Lefèvre', email: 'claire.lefevre@example.com', role: 'collaborator', active: false }
/** Technician. */
const sarah: UserProfile = { id: 'u-tech-1', displayName: 'Sarah Koné', email: 'sarah.kone@example.com', role: 'technician', active: true }
/** Technician. */
const jean: UserProfile = { id: 'u-tech-2', displayName: 'Jean Moreau', email: 'jean.moreau@example.com', role: 'technician', active: true }
/** Technician. */
const amine: UserProfile = { id: 'u-tech-3', displayName: 'Amine Benali', email: 'amine.benali@example.com', role: 'technician', active: true }
/** Support manager. */
const nadia: UserProfile = { id: 'u-manager-1', displayName: 'Nadia Lambert', email: 'nadia.lambert@example.com', role: 'manager', active: true }
/** Administrator. */
const paul: UserProfile = { id: 'u-admin-1', displayName: 'Paul Garnier', email: 'paul.garnier@example.com', role: 'admin', active: true }

/** User considered as signed in. */
export const currentUser = marc

/** All the users. */
export const users: UserProfile[] = [marc, alice, thomas, claire, sarah, jean, amine, nadia, paul]

/** Users with the technician role. */
export const technicians: UserProfile[] = [sarah, jean, amine]

/** Every page is listed during the design phase; later, the list will depend on the role. */
export const navigation: NavItem[] = [
  { label: 'Tableau de bord', to: '/dashboard', icon: 'dashboard' },
  { label: 'Tickets', to: '/tickets', icon: 'ticket' },
  { label: 'Pilotage', to: '/analytics', icon: 'chart' },
  { label: 'Utilisateurs', to: '/admin/users', icon: 'users' },
  { label: 'Catégories', to: '/admin/categories', icon: 'tag' },
]

// Categories

/** All the categories, including a disabled one. */
export const categories: Category[] = [
  { id: 'hardware', name: 'Matériel', active: true },
  { id: 'software', name: 'Logiciel', active: true },
  { id: 'network', name: 'Réseaux', active: true },
  { id: 'accounts', name: 'Accès et comptes', active: true },
  { id: 'email', name: 'Messagerie', active: true },
  { id: 'phone', name: 'Téléphonie', active: false },
]

/** Categories offered when creating a ticket. */
export const activeCategories: Category[] = categories.filter(category => category.active)

// Tickets

/** Urgent ticket in progress, used as the displayed ticket. */
const vpn: Ticket = {
  id: 'a1k9x2',
  title: 'Accès VPN bloqué depuis le télétravail',
  description: 'Depuis ce matin, le client VPN affiche « authentification refusée ».\nLe problème apparaît sur le Wi-Fi de la maison comme en partage de connexion. Poste concerné : PC-LYON-0412.',
  categoryId: 'network',
  categoryName: 'Réseaux',
  priority: 'urgent',
  status: 'in_progress',
  authorId: marc.id,
  authorName: marc.displayName,
  assigneeId: sarah.id,
  assigneeName: sarah.displayName,
  createdAt: new Date('2026-11-02T07:40:00'),
  updatedAt: new Date('2026-11-02T09:12:00'),
}

/** New unassigned ticket with a high priority. */
const billing: Ticket = {
  id: 'b7m3q8',
  title: 'Lenteur de l’application de facturation',
  description: 'Chaque enregistrement de facture prend plus de 30 secondes depuis la mise à jour de lundi.',
  categoryId: 'software',
  categoryName: 'Logiciel',
  priority: 'high',
  status: 'new',
  authorId: marc.id,
  authorName: marc.displayName,
  assigneeId: null,
  assigneeName: null,
  createdAt: new Date('2026-11-02T08:05:00'),
  updatedAt: new Date('2026-11-02T08:05:00'),
}

/** Medium priority ticket in progress. */
const adobe: Ticket = {
  id: 'c2p5w1',
  title: 'Mise à jour d’Adobe Creative Cloud impossible',
  description: 'L’installation s’arrête à 80 % avec le code d’erreur 146.',
  categoryId: 'software',
  categoryName: 'Logiciel',
  priority: 'medium',
  status: 'in_progress',
  authorId: marc.id,
  authorName: marc.displayName,
  assigneeId: jean.id,
  assigneeName: jean.displayName,
  createdAt: new Date('2026-11-01T14:20:00'),
  updatedAt: new Date('2026-11-02T08:30:00'),
}

/** Resolved low priority ticket. */
const printer: Ticket = {
  id: 'd9t4r6',
  title: 'Imprimante du 3e étage hors service',
  description: 'Bourrage papier permanent sur l’imprimante du couloir, même après redémarrage.',
  categoryId: 'hardware',
  categoryName: 'Matériel',
  priority: 'low',
  status: 'resolved',
  authorId: marc.id,
  authorName: marc.displayName,
  assigneeId: sarah.id,
  assigneeName: sarah.displayName,
  createdAt: new Date('2026-10-30T10:15:00'),
  updatedAt: new Date('2026-11-02T08:50:00'),
}

/** Urgent ticket in progress from another collaborator. */
const fileServer: Ticket = {
  id: 'e3h8n2',
  title: 'Panne du serveur de fichiers partagés',
  description: 'Le lecteur Réseaux P: est inaccessible pour tout le service comptabilité.',
  categoryId: 'hardware',
  categoryName: 'Matériel',
  priority: 'urgent',
  status: 'in_progress',
  authorId: alice.id,
  authorName: alice.displayName,
  assigneeId: amine.id,
  assigneeName: amine.displayName,
  createdAt: new Date('2026-11-02T06:55:00'),
  updatedAt: new Date('2026-11-02T09:05:00'),
}

/** New unassigned ticket from another collaborator. */
const lockedAccount: Ticket = {
  id: 'f6v1c7',
  title: 'Mot de passe expiré, compte verrouillé',
  description: 'Impossible de me connecter à ma session après trois tentatives.',
  categoryId: 'accounts',
  categoryName: 'Accès et comptes',
  priority: 'high',
  status: 'new',
  authorId: thomas.id,
  authorName: thomas.displayName,
  assigneeId: null,
  assigneeName: null,
  createdAt: new Date('2026-11-02T09:01:00'),
  updatedAt: new Date('2026-11-02T09:01:00'),
}

/** Resolved medium priority ticket from another collaborator. */
const attachments: Ticket = {
  id: 'g4b2y9',
  title: 'Messagerie : pièces jointes bloquées',
  description: 'Les fichiers PDF envoyés par nos fournisseurs n’arrivent plus.',
  categoryId: 'email',
  categoryName: 'Messagerie',
  priority: 'medium',
  status: 'resolved',
  authorId: alice.id,
  authorName: alice.displayName,
  assigneeId: sarah.id,
  assigneeName: sarah.displayName,
  createdAt: new Date('2026-10-31T16:40:00'),
  updatedAt: new Date('2026-11-01T11:00:00'),
}

/** Closed low priority ticket. */
const keyboard: Ticket = {
  id: 'h8j5k3',
  title: 'Demande de nouveau clavier',
  description: 'Plusieurs touches ne répondent plus sur le clavier du poste 42.',
  categoryId: 'hardware',
  categoryName: 'Matériel',
  priority: 'low',
  status: 'closed',
  authorId: thomas.id,
  authorName: thomas.displayName,
  assigneeId: jean.id,
  assigneeName: jean.displayName,
  createdAt: new Date('2026-10-27T09:30:00'),
  updatedAt: new Date('2026-10-29T15:10:00'),
}

/** Full list, tickets page. */
export const tickets: Ticket[] = [lockedAccount, vpn, fileServer, printer, adobe, billing, attachments, keyboard]

/** Non-closed tickets of the signed-in user, dashboard. */
export const myActiveTickets: Ticket[] = [vpn, printer, adobe, billing]

/** Unresolved urgent tickets, analytics page. */
export const urgentTickets: Ticket[] = [vpn, fileServer]

// Ticket details

/** Ticket displayed on the details page. */
export const ticketDetail = vpn

/** Comments of the displayed ticket, from oldest to newest. */
export const ticketComments: TicketComment[] = [
  {
    id: 'cm-1',
    ticketId: vpn.id,
    authorId: marc.id,
    authorName: marc.displayName,
    body: 'J’ai déjà redémarré le poste et réinstallé le client VPN, sans succès.',
    createdAt: new Date('2026-11-02T07:45:00'),
  },
  {
    id: 'cm-2',
    ticketId: vpn.id,
    authorId: sarah.id,
    authorName: sarah.displayName,
    body: 'Je vois des échecs répétés sur votre compte dans les journaux du VPN.\nPouvez-vous me confirmer la version du client installée ?',
    createdAt: new Date('2026-11-02T08:55:00'),
  },
  {
    id: 'cm-3',
    ticketId: vpn.id,
    authorId: marc.id,
    authorName: marc.displayName,
    body: 'Version 4.2.1. Je n’ai rien changé depuis vendredi.',
    createdAt: new Date('2026-11-02T09:12:00'),
  },
]

/** History of the displayed ticket, from newest to oldest. */
export const ticketHistory: HistoryEntry[] = [
  { id: 'h-4', ticketId: vpn.id, type: 'status', from: 'new', to: 'in_progress', actorName: sarah.displayName, createdAt: new Date('2026-11-02T08:15:00') },
  { id: 'h-3', ticketId: vpn.id, type: 'assignment', from: null, to: sarah.displayName, actorName: nadia.displayName, createdAt: new Date('2026-11-02T08:10:00') },
  { id: 'h-2', ticketId: vpn.id, type: 'priority', from: 'high', to: 'urgent', actorName: nadia.displayName, createdAt: new Date('2026-11-02T08:08:00') },
  { id: 'h-1', ticketId: vpn.id, type: 'created', actorName: marc.displayName, createdAt: new Date('2026-11-02T07:40:00') },
]

/** Transitions offered for the displayed ticket (status in progress). */
export const ticketTransitions: StatusTransition[] = [
  { to: 'resolved', label: 'Marquer comme résolu' },
]

// Indicators (raw values)

/** Indicators of the dashboard. */
export const dashboardStats: StatItem[] = [
  { label: 'Tickets ouverts', value: 3, hint: '+1 cette semaine' },
  { label: 'Résolus à confirmer', value: 1, hint: 'Action requise' },
  { label: 'Clôturés (30 jours)', value: 6 },
  { label: 'Temps de réponse moyen', value: '2 h 15' },
]

/** Indicators of the tickets page. */
export const ticketListStats: StatItem[] = [
  { label: 'Urgents', value: 2 },
  { label: 'En cours', value: 3 },
  { label: 'Non affectés', value: 2 },
  { label: 'Résolus (24 h)', value: 2 },
]

/** Indicators of the analytics page. */
export const analyticsStats: StatItem[] = [
  { label: 'Tickets ouverts', value: 5, hint: '2 de moins qu’hier' },
  { label: 'Non affectés', value: 2, hint: 'À traiter en priorité' },
  { label: 'Résolus (7 jours)', value: 12 },
  { label: 'Temps moyen de résolution', value: '6 h 40' },
]

/** Open tickets per technician, analytics page. */
export const workloadByTechnician: BarItem[] = [
  { label: sarah.displayName, value: 3 },
  { label: jean.displayName, value: 1 },
  { label: amine.displayName, value: 1 },
]

/** Tickets per status, analytics page. */
export const ticketsByStatus: BarItem[] = [
  { label: 'Nouveau', value: 2 },
  { label: 'En cours', value: 3 },
  { label: 'Résolu', value: 2 },
  { label: 'Clôturé', value: 1 },
]

/** Recent activity across tickets, analytics page. */
export const activityFeed: HistoryEntry[] = [
  { id: 'a-4', ticketId: lockedAccount.id, ticketTitle: lockedAccount.title, type: 'created', actorName: thomas.displayName, createdAt: new Date('2026-11-02T09:01:00') },
  { id: 'a-3', ticketId: printer.id, ticketTitle: printer.title, type: 'status', from: 'in_progress', to: 'resolved', actorName: sarah.displayName, createdAt: new Date('2026-11-02T08:50:00') },
  { id: 'a-2', ticketId: vpn.id, ticketTitle: vpn.title, type: 'status', from: 'new', to: 'in_progress', actorName: sarah.displayName, createdAt: new Date('2026-11-02T08:15:00') },
  { id: 'a-1', ticketId: fileServer.id, ticketTitle: fileServer.title, type: 'assignment', from: null, to: amine.displayName, actorName: nadia.displayName, createdAt: new Date('2026-11-02T07:05:00') },
]
