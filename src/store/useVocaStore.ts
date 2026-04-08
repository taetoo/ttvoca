import { create } from 'zustand';

export type WordStatus = 'unknown' | 'memorized' | null;

export interface Word {
  id: string;
  word: string;
  meaning: string;
  status: WordStatus;
}

interface VocaState {
  words: Word[];
  targetScore: '600' | '900' | null;
  currentIndex: number;
  
  // Actions
  setFileData: (words: Omit<Word, 'id' | 'status'>[]) => void;
  setTargetScore: (score: '600' | '900') => void;
  updateWordStatus: (id: string, status: WordStatus) => void;
  nextCard: () => void;
  resetProgress: () => void;
}

export const useVocaStore = create<VocaState>((set) => ({
  words: [],
  targetScore: null,
  currentIndex: 0,
  
  setFileData: (parsedWords) => set({ 
    words: parsedWords.map((pw, i) => ({ ...pw, id: `word-${i}`, status: null })),
    currentIndex: 0,
  }),
  setTargetScore: (score) => set({ targetScore: score }),
  
  updateWordStatus: (id, status) => set((state) => ({
    words: state.words.map((w) => w.id === id ? { ...w, status } : w),
  })),
  
  nextCard: () => set((state) => ({
    currentIndex: Math.min(state.currentIndex + 1, state.words.length)
  })),
  
  resetProgress: () => set((state) => ({
    words: state.words.map(w => ({ ...w, status: null })),
    currentIndex: 0
  }))
}));
