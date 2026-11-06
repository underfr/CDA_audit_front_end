/**
 * @file Composable loading the technicians who can be assigned to a ticket.
 */

import { equalTo, get, orderByChild, query, ref as dbRef } from 'firebase/database'
import type { UserProfile } from '~/types'

/**
 * Loads the active technicians, once and without listening to later changes.
 * Call it in a composable or in a script setup, because it uses `useNuxtApp()`.
 *
 * @returns A ref holding the technicians sorted by name, empty until they are loaded.
 */
export function useTechnicians() {
    const { $db } = useNuxtApp()
    const technicians = ref<UserProfile[]>([])

    get(query(dbRef($db, 'users'), orderByChild('role'), equalTo('technician'))).then((snapshot) => {
        technicians.value = Object.entries<Omit<UserProfile, 'id'>>(snapshot.val() ?? {})
            .map(([id, user]) => ({ id, ...user }))
            .filter((user) => user.active)
            .sort((a, b) => a.displayName.localeCompare(b.displayName, 'fr'))
    })

    return technicians
}