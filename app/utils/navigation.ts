/**
 * @file Definition of the main navigation menu.
 */

import type { NavItem } from '~/types'

/** Links of the sidebar; the default layout keeps those allowed for the signed-in user's role. */
export const NAVIGATION: NavItem[] = [
    { label: 'Tableau de bord', to: '/dashboard', icon: 'dashboard' },
    { label: 'Tickets', to: '/tickets', icon: 'ticket', roles: ['collaborator', 'technician', 'manager','admin'] },
    { label: 'Pilotage', to: '/analytics', icon: 'chart', roles: ['manager','admin'] },
    { label: 'Utilisateurs', to: '/admin/users', icon: 'users', roles: ['admin'] },
    { label: 'Catégories', to: '/admin/categories', icon: 'tag', roles: ['admin'] },
]