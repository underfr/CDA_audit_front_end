/**
 * @file Indicators computed from the loaded tickets for the dashboard, list and analytics pages.
 * Every function that depends on the current time takes it as a `now` parameter.
 */

import type { BarItem, StatItem, Ticket, TicketStatus, UserProfile } from '~/types'
import { STATUS_LABELS } from './labels'

/** One minute, in milliseconds. */
const MINUTE = 60 * 1000
/** One day, in milliseconds. */
const DAY = 24 * 60 * MINUTE

/**
 * Finds the start of the week containing a date.
 *
 * @param now - Reference date.
 * @returns Monday of that week at midnight, local time.
 */
function startOfWeek(now: Date) {
    const monday = new Date(now)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    return monday
}

/**
 * Tells whether a ticket still needs work.
 *
 * @param ticket - Ticket to check.
 * @returns `true` when its status is `new` or `in_progress`.
 */
export const isOpen = (ticket: Ticket) => ticket.status === "new" || ticket.status === "in_progress"

/**
 * Computes the indicators of the ticket management page: open urgent tickets, tickets in progress,
 * unassigned open tickets and tickets resolved during the last 24 hours.
 *
 * @param tickets - Tickets visible to the user.
 * @param now - Current time.
 * @returns The indicators, in display order.
 */
export function computeTicketListStats(tickets: Ticket[], now = new Date()): StatItem[] {
    const dayAgo = now.getTime() - DAY

    return  [
        { label: 'Urgents', value: tickets.filter(t => isOpen(t) && t.priority === 'urgent').length },
        { label: 'En cours', value: tickets.filter(t => t.status === 'in_progress').length },
        { label: 'Non affectés', value: tickets.filter(t => isOpen(t) && t.assigneeId === null).length },
        { label: 'Résolus (24 h)', value: tickets.filter(t => t.resolvedAt && t.resolvedAt.getTime() >= dayAgo).length },
    ]
}

/**
 * Formats a duration in short French units: `45 min`, `2 h 05` or `3 j 4 h`.
 *
 * @param ms - Duration in milliseconds, rounded to the nearest minute.
 * @returns The formatted duration.
 */
export function formatDuration(ms: number) {
    const minutes = Math.round(ms / MINUTE)
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} h ${String(minutes % 60).padStart(2, '0')}`
    return `${Math.floor(hours / 24)} j ${hours % 24} h`
}

/**
 * Computes the indicators of the dashboard: open tickets and those opened this week, resolved tickets
 * awaiting confirmation, tickets closed during the last 30 days and the average first response time.
 *
 * @param tickets - Tickets visible to the user.
 * @param role - Role of the user, which selects the hint shown on tickets awaiting confirmation.
 * @param now - Current time.
 * @returns The indicators, in display order.
 */
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

/**
 * Computes the indicators of the analytics page: open tickets and those created today, unassigned
 * open tickets, tickets resolved during the last 7 days and the average resolution time.
 *
 * @param tickets - All the tickets.
 * @param now - Current time.
 * @returns The indicators, in display order.
 */
export function computeAnalyticsStats(tickets: Ticket[], now = new Date()): StatItem[] {
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const weekAgo = now.getTime() - 7 * DAY

    const open = tickets.filter(isOpen)
    const openedToday = tickets.filter(t => t.createdAt.getTime() >= todayStart.getTime()).length
    const unassigned = open.filter(t => t.assigneeId === null).length
    const resolvedThisWeek = tickets.filter(t => t.resolvedAt && t.resolvedAt.getTime() >= weekAgo).length

    const durations = tickets.flatMap(t => (t.resolvedAt ? [t.resolvedAt.getTime() - t.createdAt.getTime()] : []))
    const average = durations.length ? durations.reduce((sum, d) => sum + d, 0) / durations.length : null

    return [
        { label: 'Tickets ouverts', value: open.length, hint: `${openedToday} créé(s) aujourd’hui` },
        { label: 'Non affectés', value: unassigned, hint: unassigned > 0 ? 'À traiter en priorité' : undefined },
        { label: 'Résolus (7 jours)', value: resolvedThisWeek },
        {
            label: 'Temps moyen de résolution',
            value: average === null ? '—' : formatDuration(average),
            hint: average === null ? 'Aucun ticket résolu' : undefined,
        },
    ]
}

/**
 * Counts the tickets of each status.
 *
 * @param tickets - Tickets to count.
 * @returns One row per status, in lifecycle order.
 */
export function computeTicketsByStatus(tickets: Ticket[]): BarItem[] {
    return (Object.keys(STATUS_LABELS) as TicketStatus[]).map(status => ({
        label: STATUS_LABELS[status],
        value: tickets.filter(t => t.status === status).length,
    }))
}

/**
 * Counts the open tickets assigned to each technician.
 *
 * @param tickets - Tickets to count.
 * @param technicians - Technicians to include, even with no ticket.
 * @returns One row per technician, from the most to the least loaded.
 */
export function computeWorkloadByTechnician(tickets: Ticket[], technicians: UserProfile[]): BarItem[] {
    return technicians
        .map(tech => ({
            label: tech.displayName,
            value: tickets.filter(t => isOpen(t) && t.assigneeId === tech.id).length,
        }))
        .sort((a, b) => b.value - a.value)
}
