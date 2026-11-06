/**
 * @file Shared state of the signed-in user.
 */

import type { UserProfile } from '~/types'

/**
 * Gives access to the profile of the signed-in user, loaded by the global auth middleware.
 *
 * @returns A shared ref holding the profile, or `null` when nobody is signed in.
 */
export const useProfile = () => useState<UserProfile | null>('profile', ()=>null)