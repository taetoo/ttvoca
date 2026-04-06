import { create } from 'zustand'

export interface UserSettings {
  targetScore: number | null
  theme: 'light' | 'dark' | 'system'
  learningMode: 'day' | 'random' | 'review'
  learningDay: number
  setTargetScore: (score: number) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLearningMode: (mode: 'day' | 'random' | 'review') => void
  setLearningDay: (day: number) => void
}

export const useSettingStore = create<UserSettings>((set) => ({
  targetScore: null,
  theme: 'system',
  learningMode: 'day',
  learningDay: 1,
  setTargetScore: (score) => set({ targetScore: score }),
  setTheme: (theme) => set({ theme }),
  setLearningMode: (mode) => set({ learningMode: mode }),
  setLearningDay: (day) => set({ learningDay: day }),
}))
