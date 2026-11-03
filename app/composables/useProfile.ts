import type { UserProfile } from '~/types'
export const useProfile = () => useState<UserProfile | null>('profile', ()=>null)