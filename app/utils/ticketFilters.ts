import type { Ticket, TicketFilterValues } from '~/types'

/**
 * Filtre les tickets déjà chargés selon les critères de « Gestion des tickets ».
 * Un critère vide n'est pas appliqué.
 *
 * @param tickets - les tickets visibles par l'utilisateur.
 * @param filters - les critères saisis.
 * @returns les tickets qui respectent tous les critères.
 */
export function filterTickets(tickets: Ticket[], filters: TicketFilterValues): Ticket[] {
    const search = filters.search.trim().replace(/^#/, '').toLowerCase()

    return tickets.filter((ticket) =>
        (!search || ticket.title.toLowerCase().includes(search) || ticket.id.toLowerCase().includes(search) || (ticket.number ?? '').toLowerCase().includes(search))
        && (!filters.status || ticket.status === filters.status)
        && (!filters.priority || ticket.priority === filters.priority)
        && (!filters.categoryId || ticket.categoryId === filters.categoryId),
    )
}