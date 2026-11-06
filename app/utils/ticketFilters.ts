/**
 * @file Client-side filtering of the ticket lists.
 */

import type { Ticket, TicketFilterValues } from '~/types'

/**
 * Filters already loaded tickets with the criteria of the ticket management page.
 * An empty criterion is not applied. The search is case-insensitive, ignores a leading `#`
 * and looks in the title, id and number of each ticket.
 *
 * @param tickets - Tickets visible to the user.
 * @param filters - Criteria entered by the user.
 * @returns A new array holding the tickets that meet every criterion.
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