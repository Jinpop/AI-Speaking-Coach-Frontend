import { create } from 'zustand'
import { STORAGE_KEYS } from '../../constants/storage'

type UserState = {
  userId: string
  setUserId: (userId: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  userId: localStorage.getItem(STORAGE_KEYS.userId) ?? '',
  setUserId: (userId) => {
    localStorage.setItem(STORAGE_KEYS.userId, userId)
    set({ userId })
  },
}))
