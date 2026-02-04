import { create } from 'zustand'
import type { TimerState } from '@/types'

interface TimerStore {
  timerState: TimerState
  setTimerState: (state: TimerState | ((prev: TimerState) => TimerState)) => void
}

export const useTimerStore = create<TimerStore>((set) => ({
  timerState: {
    status: 'stopped',
    remaining: 300,
    totalDuration: 300,
  },
  setTimerState: (state) =>
    set((prev) => ({
      timerState: typeof state === 'function' ? state(prev.timerState) : state,
    })),
}))
