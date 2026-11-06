/**
 * @file Firebase Realtime Database access for the tickets, their comments and their history.
 */

import {
	child,
	type DataSnapshot,
	onValue,
	push,
	ref,
	remove,
	serverTimestamp,
	equalTo,
	orderByChild,
	query,
	update,
	runTransaction,
	type DatabaseReference,
	type Query,
	type Database
} from "firebase/database";
import type { Ticket, TicketStatus, UserProfile} from "~/types";

/** Data provided by the caller: the id, number and dates are managed by the service and the database. */
export type NewTicket = Omit<Ticket, "id" | "number" | "createdAt" | "updatedAt" | "firstResponseAt" | "closedAt" | "resolvedAt">;

/**
 * Access to the tickets stored in the Realtime Database (`tickets` node).
 *
 * Instantiate it in a composable or in the script setup of a page,
 * because the constructor calls `useNuxtApp()`.
 */
export class TicketService {
	/** Realtime Database instance. */
	private db: Database;
	/** Reference to the `tickets` node. */
	private ticketsRef: DatabaseReference;
	/** Reference to the `history` node, organised by ticket. */
	private historyRef: DatabaseReference;
	/** Reference to the `comments` node, organised by ticket. */
	private commentsRef: DatabaseReference;

	/** Gets the database provided by the Firebase plugin and points at the nodes in use. */
	constructor() {
		const { $db } = useNuxtApp();
		this.db = $db
		this.ticketsRef = ref($db, "tickets");
		this.historyRef = ref($db, "history")
		this.commentsRef = ref($db, "comments")
	}

	/**
	 * Changes a ticket and traces the change in a single atomic write,
	 * which also refreshes `updatedAt`.
	 *
	 * @param ticketId - Id of the ticket to change.
	 * @param changes - Ticket fields to write.
	 * @param entry - Content of the history entry; the actor and date are added here.
	 * @param actor - User making the change.
	 * @returns A promise resolved once the write is complete.
	 */
	private updateWithHistory(ticketId: string, changes: Record<string, unknown>, entry: Record<string, unknown>, actor: UserProfile) {
		const entryId = push(child(this.historyRef, ticketId)).key;
		const updates: Record<string, unknown> = {
			[`tickets/${ticketId}/updatedAt`]: serverTimestamp(),
			[`history/${ticketId}/${entryId}`]: { ...entry, actorId: actor.id, actorName: actor.displayName, createdAt: serverTimestamp() },
		};
		for (const [field, value] of Object.entries(changes)) updates[`tickets/${ticketId}/${field}`] = value;
		return update(ref(this.db), updates);
	}

	/**
	 * Assigns a ticket to a technician and traces the change.
	 *
	 * @param ticket - Ticket to assign.
	 * @param technician - Technician receiving the ticket.
	 * @param actor - User making the assignment.
	 * @returns A promise resolved once the write is complete.
	 */
	assign(ticket: Ticket, technician: UserProfile, actor: UserProfile) {
		return this.updateWithHistory(
			ticket.id,
			{ assigneeId: technician.id, assigneeName: technician.displayName },
			{ type: "assignment", from: ticket.assigneeName, to: technician.displayName },
			actor,
		);
	}

	/**
	 * Changes the priority of a ticket and traces the change.
	 *
	 * @param ticket - Ticket to change.
	 * @param priority - New priority.
	 * @param actor - User making the change.
	 * @returns A promise resolved once the write is complete.
	 */
	updatePriority(ticket: Ticket, priority: TicketPriority, actor: UserProfile) {
		return this.updateWithHistory(ticket.id, { priority }, { type: "priority", from: ticket.priority, to: priority }, actor);
	}

	/**
	 * Listens to the history of a ticket in real time, from newest to oldest.
	 *
	 * @param ticketId - Id of the ticket.
	 * @param callback - Receives the history entries.
	 * @returns A function to call (for example in `onUnmounted`) to stop listening.
	 */
	watchHistory(ticketId: string, callback: (entries: HistoryEntry[]) => void) {
		return onValue(child(this.historyRef, ticketId), (snapshot) => {
			const entries: HistoryEntry[] = [];
			// Les clés push sont chronologiques : unshift place la plus récente en tête
			snapshot.forEach((entry) => {
				entries.unshift({ ...entry.val(), id: entry.key, ticketId, createdAt: new Date(entry.val().createdAt) });
			});
			callback(entries);
		});
	}

	/**
	 * Listens to the history of all the tickets (activity feed of the analytics page),
	 * sorted from newest to oldest.
	 *
	 * @param callback - Receives all the history entries.
	 * @returns A function to call (for example in `onUnmounted`) to stop listening.
	 */
	watchAllHistory(callback: (entries: HistoryEntry[]) => void) {
		return onValue(this.historyRef, (snapshot) => {
			const entries: HistoryEntry[] = [];
			// Le nœud `history` est rangé par ticket : history/<ticketId>/<entryId>
			snapshot.forEach((ticketHistory) => {
				ticketHistory.forEach((entry) => {
					entries.push({ ...entry.val(), id: entry.key, ticketId: ticketHistory.key, createdAt: new Date(entry.val().createdAt) });
				});
			});
			entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
			callback(entries);
		});
	}

	/**
	 * Listens to a list of tickets and converts it on every change.
	 *
	 * @param source - Node or query to listen to.
	 * @param callback - Receives the array of tickets.
	 * @returns A function that stops listening.
	 */
	private watchList(source: Query, callback: (tickets: Ticket[]) => void) {
		return onValue(source, (snapshot) => {
			const tickets: Ticket[] = [];
			snapshot.forEach((ticketSnapshot) => {
				tickets.push(this.toTicket(ticketSnapshot));
			});
			callback(tickets);
		});
	}

	/**
	 * Converts a Firebase snapshot into a `Ticket` usable by the interface.
	 * Adds the id (the node key), restores missing fields to `null`
	 * (the Realtime Database does not store `null`) and converts the dates.
	 *
	 * @param snapshot - Snapshot of a ticket.
	 * @returns The converted ticket.
	 */
	private toTicket(snapshot: DataSnapshot): Ticket {
		const data = snapshot.val();
		return {
			...data,
			id: snapshot.key,
			assigneeId: data.assigneeId ?? null,
			assigneeName: data.assigneeName ?? null,
			createdAt: new Date(data.createdAt),
			updatedAt: new Date(data.updatedAt),
			firstResponseAt: data.firstResponseAt ? new Date(data.firstResponseAt) : null,
			closedAt: data.closedAt ? new Date(data.closedAt) : null,
			resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : null
		};
	}

	/**
	 * Creates a ticket with a key generated by Firebase and a readable number (e.g. "RES-0042").
	 * The status is always `new` (CA-01), whatever value is provided.
	 * The creation and update dates are set by the server.
	 *
	 * @param ticket - Ticket data, without id, number or dates.
	 * @returns The reference of the created ticket; its id is in `.key`.
	 */
	async create(ticket: NewTicket) {
		// La transaction garantit deux numéros différents si deux tickets sont créés en même temps
		const { snapshot } = await runTransaction(ref(this.db, "counters/tickets"), (current: number | null) => (current ?? 0) + 1);
		return push(this.ticketsRef, {
			...ticket,
			number: `${categoryCode(ticket.categoryName)}-${String(snapshot.val()).padStart(4, "0")}`,
			status: "new",
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
	}

	/**
	 * Listens to a ticket in real time: the callback runs right away,
	 * then on every change of the ticket.
	 *
	 * @param id - Id of the ticket to listen to.
	 * @param callback - Receives the ticket, or `null` if it does not exist.
	 * @param onError - Called when the read is refused, for example by the security rules.
	 * @returns A function to call (for example in `onUnmounted`) to stop listening.
	 */
	watchById(id: string, callback: (ticket: Ticket | null) => void, onError?: (error: Error) => void) {
		return onValue(child(this.ticketsRef, id), (snapshot) => {
			callback(snapshot.exists() ? this.toTicket(snapshot) : null);
		}, onError);
	}

	/**
	 * Listens to all the tickets in real time: the callback runs right away,
	 * then on every addition, change or deletion.
	 *
	 * @param callback - Receives the array of tickets.
	 * @returns A function to call (for example in `onUnmounted`) to stop listening.
	 */
	list(callback: (tickets: Ticket[]) => void) {
		return this.watchList(this.ticketsRef, callback)
	}

	/**
	 * Listens in real time to the tickets a user works with: all of them for managers and admins,
	 * assigned ones for technicians and authored ones for collaborators.
	 *
	 * @param user - Signed-in user.
	 * @param callback - Receives the array of tickets.
	 * @returns A function to call (for example in `onUnmounted`) to stop listening.
	 */
	listFor(user: UserProfile, callback: (tickets: Ticket[])=>void){
		if (user.role === "manager" || user.role === "admin") return this.list(callback)
		const field = user.role === "technician" ? "assigneeId" : "authorId"
		return this.watchList(query(this.ticketsRef, orderByChild(field), equalTo(user.id)), callback)
	}

	/**
	 * Changes the status, sets the tracking dates and traces the change.
	 *
	 * @param ticket - Ticket to change.
	 * @param status - New status.
	 * @param actor - User making the change.
	 * @returns A promise resolved once the write is complete.
	 */
	updateStatus(ticket: Ticket, status: TicketStatus, actor: UserProfile) {
		return this.updateWithHistory(
			ticket.id,
			{
				status,
				...(ticket.status === "new" && status === "in_progress" ? { firstResponseAt: serverTimestamp() } : {}),
				...(status === "resolved" ? { resolvedAt: serverTimestamp() } : {}),
				...(status === "closed" ? { closedAt: serverTimestamp() } : {}),
			},
			{ type: "status", from: ticket.status, to: status },
			actor,
		);
	}

	/**
	 * Listens to the comments of a ticket, from oldest to newest.
	 *
	 * @param ticketId - Id of the ticket.
	 * @param callback - Receives the list of comments.
	 * @returns A function to call to stop listening.
	 */
	watchComments(ticketId: string, callback: (comments: TicketComment[]) => void) {
		return onValue(child(this.commentsRef, ticketId), (snapshot) => {
			const comments: TicketComment[] = [];
			// Les clés push sont chronologiques : l'ordre de lecture est l'ordre d'écriture
			snapshot.forEach((comment) => {
				comments.push({ ...comment.val(), id: comment.key, ticketId, createdAt: new Date(comment.val().createdAt) });
			});
			callback(comments);
		});
	}

	/**
	 * Posts a comment on a ticket.
	 *
	 * @param ticketId - Id of the ticket.
	 * @param body - Comment text, already trimmed.
	 * @param author - Signed-in user.
	 * @returns The reference of the created comment.
	 */
	addComment(ticketId: string, body: string, author: UserProfile) {
		return push(child(this.commentsRef, ticketId), {
			authorId: author.id,
			authorName: author.displayName,
			body,
			createdAt: serverTimestamp(),
		});
	}

}
