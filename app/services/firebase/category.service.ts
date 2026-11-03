import {
	child,
	type DataSnapshot,
	equalTo,
	get,
	onValue,
	orderByChild,
	push,
	query,
	ref,
	remove,
	update,
	type DatabaseReference,
	type Query
} from "firebase/database";
import type { Category } from "~/types";

/** Ce que l'appelant fournit : l'id est la clé générée par Firebase. */
export type NewCategory = Omit<Category, "id">;

/**
 * Accès aux catégories stockées dans la Realtime Database (nœud `categories`).
 *
 * À instancier dans un composable ou dans le script setup d'une page,
 * car le constructeur appelle `useNuxtApp()`.
 */
export class CategoryService {
	private categoriesRef: DatabaseReference;
	private ticketsRef: DatabaseReference;

	/** Récupère la base fournie par le plugin Firebase et pointe sur le nœud `categories`. */
	constructor() {
		const { $db } = useNuxtApp();
		this.categoriesRef = ref($db, "categories");
		this.ticketsRef = ref($db, "tickets");
	}

	/**
	 * Transforme un snapshot Firebase en `Category` utilisable par l'interface.
	 * Ajoute l'id (la clé du nœud) et considère la catégorie active si le champ est absent.
	 *
	 * @param snapshot - le snapshot d'une catégorie.
	 * @returns la catégorie convertie.
	 */
	private toCategory(snapshot: DataSnapshot): Category {
		const data = snapshot.val();
		return {
			id: snapshot.key!,
			name: data.name,
			active: data.active ?? true,
		};
	}

	/**
	 * Écoute une liste de catégories et la convertit à chaque changement.
	 *
	 * @param source - le nœud ou la requête à écouter.
	 * @param callback - reçoit le tableau des catégories.
	 * @returns une fonction pour arrêter l'écoute.
	 */
	private watchList(source: Query, callback: (categories: Category[]) => void) {
		return onValue(source, (snapshot) => {
			const categories: Category[] = [];
			snapshot.forEach((categorySnapshot) => {
				categories.push(this.toCategory(categorySnapshot));
			});
			callback(categories);
		});
	}

	/**
	 * Crée une catégorie avec une clé générée par Firebase.
	 *
	 * @param category - le nom et l'état de la catégorie, sans id.
	 * @returns la référence de la catégorie créée ; son id est dans `.key`.
	 */
	create(category: NewCategory) {
		return push(this.categoriesRef, {
			name: category.name,
			active: category.active,
		});
	}

	/**
	 * Modifie uniquement les champs fournis (par exemple le nom, ou `active` pour désactiver).
	 *
	 * @param id - l'id de la catégorie à modifier.
	 * @param changes - les champs à changer.
	 * @returns une Promise résolue une fois l'écriture terminée.
	 */
	update(id: string, changes: Partial<NewCategory>) {
		return update(child(this.categoriesRef, id), changes);
	}

	/**
	 * Active ou désactive une catégorie.
	 * Une catégorie désactivée n'est plus proposée à la création d'un ticket,
	 * mais les tickets existants la gardent.
	 *
	 * @param id - l'id de la catégorie.
	 * @param active - `false` pour désactiver, `true` pour réactiver.
	 * @returns une Promise résolue une fois l'écriture terminée.
	 */
	setActive(id: string, active: boolean) {
		return this.update(id, { active });
	}

	/**
	 * Supprime définitivement une catégorie, uniquement si aucun ticket ne l'utilise
	 * (équivalent d'un `ON DELETE RESTRICT`). Sert à corriger une catégorie créée par erreur ;
	 * pour une catégorie déjà utilisée, la désactiver avec `setActive(id, false)`.
	 *
	 * @param id - l'id de la catégorie à supprimer.
	 * @returns une Promise résolue une fois la suppression terminée.
	 * @throws si au moins un ticket utilise cette catégorie.
	 */
	async delete(id: string) {
		const linkedTickets = await get(query(this.ticketsRef, orderByChild("categoryId"), equalTo(id)));
		if (linkedTickets.exists()) {
			throw new Error("Impossible de supprimer : des tickets utilisent cette catégorie. Désactivez-la plutôt.");
		}
		return remove(child(this.categoriesRef, id));
	}

	/**
	 * Écoute la liste de toutes les catégories en temps réel : le callback est appelé
	 * tout de suite, puis à chaque ajout, modification ou suppression.
	 *
	 * @param callback - reçoit le tableau des catégories.
	 * @returns une fonction à appeler (par exemple dans `onUnmounted`) pour arrêter l'écoute.
	 */
	list(callback: (categories: Category[]) => void) {
		return this.watchList(this.categoriesRef, callback);
	}

	/**
	 * Écoute en temps réel les catégories actives, celles proposées à la création d'un ticket.
	 *
	 * @param callback - reçoit le tableau des catégories actives.
	 * @returns une fonction à appeler (par exemple dans `onUnmounted`) pour arrêter l'écoute.
	 */
	listActive(callback: (categories: Category[]) => void) {
		return this.watchList(query(this.categoriesRef, orderByChild("active"), equalTo(true)), callback);
	}
}
