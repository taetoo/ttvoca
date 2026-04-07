import { create } from 'zustand'
import { WordItem } from '@/utils/words'

export interface UserSettings {
  targetScore: number | null
  theme: 'light' | 'dark' | 'system'
  learningMode: 'day' | 'random' | 'review'
  learningDay: number
  
  // 3-Phase 학습 시스템
  studyPhase: 'study' | 'quiz' | 'review'
  studyRound: number
  missedWords: WordItem[]
  quizResults: { correct: number; incorrect: number }
  
  // 기본 설정 액션
  setTargetScore: (score: number) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLearningMode: (mode: 'day' | 'random' | 'review') => void
  setLearningDay: (day: number) => void
  
  // Phase 관련 액션
  setStudyPhase: (phase: 'study' | 'quiz' | 'review') => void
  incrementRound: () => void
  addMissedWord: (word: WordItem) => void
  setQuizResults: (results: { correct: number; incorrect: number }) => void
  resetStudySession: () => void
}

export const useSettingStore = create<UserSettings>((set) => ({
  targetScore: null,
  theme: 'system',
  learningMode: 'day',
  learningDay: 1,
  
  // 3-Phase 초기값
  studyPhase: 'study',
  studyRound: 1,
  missedWords: [],
  quizResults: { correct: 0, incorrect: 0 },
  
  // 기본 설정 액션
  setTargetScore: (score) => set({ targetScore: score }),
  setTheme: (theme) => set({ theme }),
  setLearningMode: (mode) => set({ learningMode: mode }),
  setLearningDay: (day) => set({ learningDay: day }),
  
  // Phase 관련 액션
  setStudyPhase: (phase) => set({ studyPhase: phase }),
  incrementRound: () => set((state) => ({ studyRound: state.studyRound + 1 })),
  addMissedWord: (word) => set((state) => ({
    missedWords: state.missedWords.some(w => w.id === word.id) 
      ? state.missedWords 
      : [...state.missedWords, word]
  })),
  setQuizResults: (results) => set({ quizResults: results }),
  resetStudySession: () => set({
    studyPhase: 'study',
    studyRound: 1,
    missedWords: [],
    quizResults: { correct: 0, incorrect: 0 },
  }),
}))
