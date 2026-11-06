/**
 * @file Form drafts saved in localStorage, per user.
 */

import type { Ref } from 'vue'

/** Prefix of the localStorage keys holding drafts. */
const PREFIX = 'draft:'

/**
 * Builds the localStorage key of a draft.
 * The key contains the user id: on a shared computer, nobody retrieves someone else's draft.
 *
 * @param name - Name of the draft.
 * @returns The key specific to the signed-in user.
 */
function draftKey(name: string) {
    return `${PREFIX}${useProfile().value?.id}:${name}`
}

/**
 * Reads a draft from localStorage.
 *
 * @template T - Type of the form value.
 * @param key - localStorage key of the draft.
 * @param initial - Value of the empty form, returned when there is no usable draft.
 * @returns The stored value, merged over `initial` when it is an object.
 */
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
 * Form value saved in localStorage: it survives a page reload.
 * The draft is deleted as soon as the value returns to its initial state (form submitted).
 *
 * @template T - Type of the form value.
 * @param name - Name of the draft, unique per form (e.g. `comment:${ticketId}`).
 * @param initial - Value of the empty form.
 * @returns A ref to use instead of `ref(initial)`.
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

/**
 * Deletes a draft, for example when the form is submitted from the parent page.
 *
 * @param name - Name of the draft.
 */
export function clearDraft(name: string) {
    try {
        localStorage.removeItem(draftKey(name))
    } catch {
        // Stockage bloqué : rien à supprimer
    }
}

/** Deletes all the drafts: after signing out, nothing remains on the computer. */
export function clearAllDrafts() {
    try {
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith(PREFIX)) localStorage.removeItem(key)
        }
    } catch {
        // Stockage bloqué : rien à supprimer
    }
}