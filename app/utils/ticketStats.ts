import type { Role, StatItem, Ticket } from '~/types'

const MINUTE = 60 * 1000
const DAY = 24 * 60 * MINUTE

function startOfWeek(now: Date) {
    const monday = new Date(now)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    return monday
}

export const isOpen = (ticket: Ticket) => ticket.status === "new" || ticket.status === "in_progress"

export function computeTicketListStats(tickets: Ticket[], now = new Date()): StatItem[] {
    const dayAgo = now.getTime() - DAY

    return  [
        { label: 'Urgents', value: tickets.filter(t => isOpen(t) && t.priority === 'urgent').length },
        { label: 'En cours', value: tickets.filter(t => t.status === 'in_progress').length },
        { label: 'Non affectés', value: tickets.filter(t => isOpen(t) && t.assigneeId === null).length },
        { label: 'Résolus (24 h)', value: tickets.filter(t => t.resolvedAt && t.resolvedAt.getTime() >= dayAgo).length },
    ]
}

export function formatDuration(ms: number) {
    const minutes = Math.round(ms / MINUTE)
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} h ${String(minutes % 60).padStart(2, '0')}`
    return `${Math.floor(hours / 24)} j ${hours % 24} h`
}

export function computeDashboardStats(tickets: Ticket[], role: Role, now = new Date()): StatItem[] {
    const weekStart = startOfWeek(now).getTime()
    const monthAgo = now.getTime() - 30 * DAY

    const open = tickets.filter(t => t.status === 'new' || t.status === 'in_progress').length
    const openedThisWeek = tickets.filter(t => t.createdAt.getTime() >= weekStart).length
    const toConfirm = tickets.filter(t => t.status === 'resolved').length
    const closedRecently = tickets.filter(t => t.status === 'closed' && t.closedAt && t.closedAt.getTime() >= monthAgo).length

    const delays = tickets.flatMap(t => (t.firstResponseAt ? [t.firstResponseAt.getTime() - t.createdAt.getTime()] : []))
    const average = delays.length ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length : null

    return [
        { label: 'Tickets ouverts', value: open, hint: `+${openedThisWeek} cette semaine` },
        {
            label: 'Résolus à confirmer',
            value: toConfirm,
            hint: toConfirm > 0 ? (role === 'collaborator' ? 'Action requise' : 'En attente du demandeur') : undefined,
        },
        { label: 'Clôturés (30 jours)', value: closedRecently },
        {
            label: 'Temps de réponse moyen',
            value: average === null ? '—' : formatDuration(average),
            hint: average === null ? 'Aucun ticket pris en charge' : undefined,
        },
    ]
}