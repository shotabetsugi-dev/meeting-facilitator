import { create } from 'zustand'
import type { UserPresence } from '@/types'

interface PresenceStore {
  presences: UserPresence[]
  myPresence: { section: string; field?: string } | null
  setPresences: (presences: UserPresence[]) => void
  updateMyPresence: (presence: { section: string; field?: string }) => void
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  presences: [],
  myPresence: null,
  setPresences: (presences) => set({ presences }),
  updateMyPresence: (presence) => set({ myPresence: presence }),
}))
