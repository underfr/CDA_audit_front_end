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
	type DatabaseReference,
	type Query
} from "firebase/database";
import type { Ticket, TicketStatus, UserProfile } from "~/types";

/** Ce que l'appelant fournit : id et dates sont gérés par la base. */
export type NewTicket = Omit<Ticket, "id" | "createdAt" | "updatedAt" | "firstResponseAt" | "closedAt" | "resolvedAt">;

/**
 * Accès aux tickets stockés dans la Realtime Database (nœud `tickets`).
 *
 * À instancier dans un composable ou dans le script setup d'une page,
 * car le constructeur appelle `useNuxtApp()`.
 */
export class TicketService {
	private ticketsRef: DatabaseReference;

	/** Récupère la base fournie par le plugin Firebase et pointe sur le nœud `tickets`. */
	constructor() {
		const { $db } = useNuxtApp();
		this.ticketsRef = ref($db, "tickets");
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
	 * Crée un ticket avec une clé générée par Firebase.
	 * Le statut est toujours `new` (CA-01), quelle que soit la valeur fournie.
	 * Les dates de création et de mise à jour sont posées par le serveur.
	 *
	 * @param ticket - les données du ticket, sans id ni dates.
	 * @returns la référence du ticket créé ; son id est dans `.key`.
	 */
	create(ticket: NewTicket) {
		return push(this.ticketsRef, {
			...ticket,
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
	 * @returns une fonction à appeler (par exemple dans `onUnmounted`) pour arrêter l'écoute.
	 */
	watchById(id: string, callback: (ticket: Ticket | null) => void) {
		return onValue(child(this.ticketsRef, id), (snapshot) => {
			callback(snapshot.exists() ? this.toTicket(snapshot) : null);
		});
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
		if (user.role === "manager") return this.list(callback)
		const field = user.role === "technician" ? "assigneeId" : "authorId"
		return this.watchList(query(this.ticketsRef, orderByChild(field), equalTo(user.id)), callback)
	}

	/**
     * Change le statut d'un ticket et met à jour `updatedAt`.
     * Les transitions autorisées (§4.1 du cadrage) doivent être vérifiées
     * par les règles de sécurité.
     *
     * @param id - l'id du ticket à modifier.
     * @param from
     * @param status - le nouveau statut.
     * @returns une Promise résolue une fois l'écriture terminée.
     */
	updateStatus(id: string, from: TicketStatus, status: TicketStatus) {
		return update(child(this.ticketsRef, id), {
			status,
			updatedAt: serverTimestamp(),
			...(from === "new" && status === "in_progress" ? { firstResponseAt: serverTimestamp() } : {}),
			...(status === "closed" ? { closedAt: serverTimestamp() } : {}),
			...(status === "resolved" ? { resolvedAt: serverTimestamp() } : {})
		});
	}

	listByAuthor(authorId: string, callback: (tickets: Ticket[]) => void){
		return this.watchList(query(this.ticketsRef, orderByChild("authorId"), equalTo(authorId)), callback)
	}

}
