import { create } from 'zustand'

type UserState = {
  userId: string
  setUserId: (userId: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  userId: localStorage.getItem('userId') ?? '',
  setUserId: (userId) => {
    localStorage.setItem('userId', userId)
    set({ userId })
  },
}))
