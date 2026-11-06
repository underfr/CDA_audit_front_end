/**
 * @file Helpers building the readable ticket numbers.
 */

import type { Ticket } from '~/types'

/**
 * Builds the three-letter code of a category from its name: "Réseaux" gives "RES".
 *
 * @param name - Category name.
 * @returns The upper-case code without accents, or `GEN` when the name holds no Latin letter.
 */
export function categoryCode(name: string) {
    return name.normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3) || 'GEN'
}

/**
 * Formats the number displayed for a ticket.
 * Tickets created before numbering existed keep their Firebase id.
 *
 * @param ticket - Ticket to display.
 * @returns The number or id, prefixed with `#`.
 */
export const ticketNumber = (ticket: Ticket) => `#${ticket.number ?? ticket.id}`