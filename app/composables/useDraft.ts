import type { Ref } from 'vue'

const PREFIX = 'draft:'

// La clé contient l'id de l'utilisateur : sur un poste partagé, personne ne récupère le brouillon d'un autre
function draftKey(name: string) {
    return `${PREFIX}${useProfile().value?.id}:${name}`
}

function readDraft<T>(key: string, initial: T): T {
    try {
        const stored = JSON.parse(localStorage.getItem(key) ?? 'null')
        if (stored === null || typeof stored !== typeof initial) return initial
        // On repart des champs de `initial` : un brouillon plus ancien ne casse pas le formulaire
        return typeof initial === 'object' ? { ...initial, ...stored } : stored
    } catch {
        return initial // stockage bloqué ou contenu illisible
    }
}

/**
 * Valeur de formulaire sauvegardée en localStorage : elle survit au rechargement de la page.
 * Le brouillon est supprimé dès que la valeur revient à son état initial (formulaire envoyé).
 *
 * @param name - le nom du brouillon, unique par formulaire (ex. `comment:${ticketId}`).
 * @param initial - la valeur du formulaire vide.
 * @returns un ref à utiliser à la place de `ref(initial)`.
 */
export function useDraft<T>(name: string, initial: T): Ref<T> {
    const key = draftKey(name)
    const empty = JSON.stringify(initial)
    const draft = ref(readDraft(key, initial)) as Ref<T>

    // flush 'sync' : le brouillon est à jour même si une navigation suit immédiatement
    watch(draft, (value) => {
        const json = JSON.stringify(value)
        try {
            if (json === empty) localStorage.removeItem(key)
            else localStorage.setItem(key, json)
        } catch {
            // Stockage plein ou bloqué : le formulaire reste utilisable, sans sauvegarde
        }
    }, { deep: true, flush: 'sync' })

    return draft
}

/** Supprime un brouillon, par exemple quand le formulaire est envoyé depuis la page parente. */
export function clearDraft(name: string) {
    try {
        localStorage.removeItem(draftKey(name))
    } catch {
        // Stockage bloqué : rien à supprimer
    }
}

/** Supprime tous les brouillons : à la déconnexion, rien ne reste sur le poste. */
export function clearAllDrafts() {
    try {
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith(PREFIX)) localStorage.removeItem(key)
        }
    } catch {
        // Stockage bloqué : rien à supprimer
    }
}