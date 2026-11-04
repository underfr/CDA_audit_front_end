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

/** Ce que l'appelant fournit : id et dates sont gérés par la base. */
export type NewTicket = Omit<Ticket, "id" | "number" | "createdAt" | "updatedAt" | "firstResponseAt" | "closedAt" | "resolvedAt">;

/**
 * Accès aux tickets stockés dans la Realtime Database (nœud `tickets`).
 *
 * À instancier dans un composable ou dans le script setup d'une page,
 * car le constructeur appelle `useNuxtApp()`.
 */
export class TicketService {
	private db: Database;
	private ticketsRef: DatabaseReference;
	private historyRef: DatabaseReference;
	private commentsRef: DatabaseReference;

	/** Récupère la base fournie par le plugin Firebase et pointe sur le nœud `tickets`. */
	constructor() {
		const { $db } = useNuxtApp();
		this.db = $db
		this.ticketsRef = ref($db, "tickets");
		this.historyRef = ref($db, "history")
		this.commentsRef = ref($db, "comments")
	}

	private updateWithHistory(ticketId: string, changes: Record<string, unknown>, entry: Record<string, unknown>, actor: UserProfile) {
		const entryId = push(child(this.historyRef, ticketId)).key;
		const updates: Record<string, unknown> = {
			[`tickets/${ticketId}/updatedAt`]: serverTimestamp(),
			[`history/${ticketId}/${entryId}`]: { ...entry, actorId: actor.id, actorName: actor.displayName, createdAt: serverTimestamp() },
		};
		for (const [field, value] of Object.entries(changes)) updates[`tickets/${ticketId}/${field}`] = value;
		return update(ref(this.db), updates);
	}

	assign(ticket: Ticket, technician: UserProfile, actor: UserProfile) {
		return this.updateWithHistory(
			ticket.id,
			{ assigneeId: technician.id, assigneeName: technician.displayName },
			{ type: "assignment", from: ticket.assigneeName, to: technician.displayName },
			actor,
		);
	}

	updatePriority(ticket: Ticket, priority: TicketPriority, actor: UserProfile) {
		return this.updateWithHistory(ticket.id, { priority }, { type: "priority", from: ticket.priority, to: priority }, actor);
	}

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
	 * Écoute l'historique de tous les tickets (flux d'activité de la page Pilotage),
	 * trié du plus récent au plus ancien.
	 *
	 * @param callback - reçoit toutes les entrées d'historique.
	 * @returns une fonction à appeler (par exemple dans `onUnmounted`) pour arrêter l'écoute.
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
	 * Transforme un snapshot Firebase en `Ticket` utilisable par l'interface.
	 * Ajoute l'id (la clé du nœud), remet à `null` les champs absents
	 * (Realtime Database ne stocke pas les `null`) et convertit les dates.
	 *
	 * @param snapshot - le snapshot d'un ticket.
	 * @returns le ticket converti.
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
	 * Crée un ticket avec une clé générée par Firebase et un numéro lisible (ex. « RES-0042 »).
	 * Le statut est toujours `new` (CA-01), quelle que soit la valeur fournie.
	 * Les dates de création et de mise à jour sont posées par le serveur.
	 *
	 * @param ticket - les données du ticket, sans id, numéro ni dates.
	 * @returns la référence du ticket créé ; son id est dans `.key`.
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
	 * Modifie uniquement les champs fournis et met à jour `updatedAt`.
	 *
	 * @param id - l'id du ticket à modifier.
	 * @param changes - les champs à changer.
	 * @returns une Promise résolue une fois l'écriture terminée.
	 */
	update(id: string, changes: Partial<NewTicket>) {
		return update(child(this.ticketsRef, id), {
			...changes,
			updatedAt: serverTimestamp(),
		});
	}

	/**
	 * Supprime définitivement un ticket.
	 * La note de cadrage ne prévoit pas de suppression : les règles de sécurité
	 * doivent la refuser (un ticket se termine au statut `closed`).
	 *
	 * @param id - l'id du ticket à supprimer.
	 * @returns une Promise résolue une fois la suppression terminée.
	 */
	delete(id: string) {
		return remove(child(this.ticketsRef, id));
	}

	/**
     * Écoute un ticket en temps réel : le callback est appelé tout de suite,
     * puis à chaque modification du ticket.
     *
     * @param id - l'id du ticket à écouter.
     * @param callback - reçoit le ticket, ou `null` s'il n'existe pas.
     * @param onError
     * @returns une fonction à appeler (par exemple dans `onUnmounted`) pour arrêter l'écoute.
     */

	watchById(id: string, callback: (ticket: Ticket | null) => void, onError?: (error: Error) => void) {
		return onValue(child(this.ticketsRef, id), (snapshot) => {
			callback(snapshot.exists() ? this.toTicket(snapshot) : null);
		}, onError);
	}

	/**
	 * Écoute la liste de tous les tickets en temps réel : le callback est appelé
	 * tout de suite, puis à chaque ajout, modification ou suppression.
	 *
	 * @param callback - reçoit le tableau des tickets.
	 * @returns une fonction à appeler (par exemple dans `onUnmounted`) pour arrêter l'écoute.
	 */
	list(callback: (tickets: Ticket[]) => void) {
		return this.watchList(this.ticketsRef, callback)
	}

	listFor(user: UserProfile, callback: (tickets: Ticket[])=>void){
		if (user.role === "manager" || user.role === "admin") return this.list(callback)
		const field = user.role === "technician" ? "assigneeId" : "authorId"
		return this.watchList(query(this.ticketsRef, orderByChild(field), equalTo(user.id)), callback)
	}

	/**
	 * Change le statut, pose les dates de suivi et trace le changement.
	 *
	 * @param ticket - le ticket à modifier.
	 * @param status - le nouveau statut.
	 * @param actor - l'utilisateur qui fait l'action.
	 * @returns une Promise résolue une fois l'écriture terminée.
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
	 * Écoute les commentaires d'un ticket, du plus ancien au plus récent.
	 *
	 * @param ticketId - l'id du ticket.
	 * @param callback - reçoit la liste des commentaires.
	 * @returns une fonction à appeler pour arrêter l'écoute.
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
	 * Publie un commentaire sur un ticket.
	 *
	 * @param ticketId - l'id du ticket.
	 * @param body - le texte du commentaire, déjà nettoyé.
	 * @param author - l'utilisateur connecté.
	 * @returns la référence du commentaire créé.
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
