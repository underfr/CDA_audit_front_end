import type { Ticket } from '~/types'

/** Code de 3 lettres tiré du nom de la catégorie : « Réseaux » → « RES ». */
export function categoryCode(name: string) {
    return name.normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3) || 'GEN'
}

/** Numéro affiché ; les tickets créés avant la numérotation gardent leur id Firebase. */
export const ticketNumber = (ticket: Ticket) => `#${ticket.number ?? ticket.id}`