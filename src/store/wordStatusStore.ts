import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WordStatus = 'memorized' | 'unknown' | 'unseen'

interface WordStatusState {
  statuses: Record<number, WordStatus>
  setStatus: (wordId: number, status: WordStatus) => void
  resetStatuses: () => void
  setBulkStatuses: (statuses: Record<number, WordStatus>) => void
}

export const useWordStatusStore = create<WordStatusState>()(
  persist(
    (set) => ({
      statuses: {},
      setStatus: (wordId, status) =>
        set((state) => ({
          statuses: {
            ...state.statuses,
            [wordId]: status,
          },
        })),
      setBulkStatuses: (statuses) => set({ statuses }),
      resetStatuses: () => set({ statuses: {} }),
    }),
    {
      name: 'word-status-storage',
    }
  )
)
