import { equalTo, get, orderByChild, query, ref as dbRef } from 'firebase/database'
import type { UserProfile } from '~/types'

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