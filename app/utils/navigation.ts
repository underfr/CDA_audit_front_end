import type { NavItem } from '~/types'

export const NAVIGATION: NavItem[] = [
    { label: 'Tableau de bord', to: '/dashboard', icon: 'dashboard' },
    { label: 'Tickets', to: '/tickets', icon: 'ticket', roles: ['collaborator', 'technician', 'manager'] },
    { label: 'Pilotage', to: '/analytics', icon: 'chart', roles: ['manager'] },
    { label: 'Utilisateurs', to: '/admin/users', icon: 'users', roles: ['admin'] },
    { label: 'Catégories', to: '/admin/categories', icon: 'tag', roles: ['admin'] },
]