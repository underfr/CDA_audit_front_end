import { child, push, ref, serverTimestamp, update, type DatabaseReference } from 'firebase/database'
import type { Ticket } from '~/types'

/** Ce que l'appelant fournit : id et dates sont gérés par la base. */
export type NewTicket = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>

export class TicketService {
  private ticketsRef: DatabaseReference

  constructor() {
    const { $db } = useNuxtApp()
    this.ticketsRef = ref($db, 'tickets')
  }

  create(ticket: NewTicket) {
    return push(this.ticketsRef, {
      ...ticket,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  update(id: string, changes: Partial<NewTicket>) {
    return update(child(this.ticketsRef, id), {
      ...changes,
      updatedAt: serverTimestamp(),
    })
  }
}