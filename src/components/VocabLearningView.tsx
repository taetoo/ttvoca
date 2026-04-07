"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Bookmark, Check, RotateCcw } from 'lucide-react'
import { useThemeStore } from '@/store/useThemeStore'

interface WordData {
  id: string
  word: string
  partOfSpeech: string
  phonetic: string
  meaning: string
  example: string
}

const DEMO_WORD: WordData = {
  id: '1',
  word: 'Accomplish',
  partOfSpeech: 'verb',
  phonetic: '/əˈkʌm.plɪʃ/',
  meaning: '완수하다, 성취하다, 해내다',
  example: 'The team worked hard to accomplish the mission.'
}

/**
 * VocabLearningView Component
 * 'Minimal Focus' 디자인 시스템이 적용된 메인 학습 화면 데모 컴포넌트입니다.
 */
export default function VocabLearningView() {
  const { isDarkMode, toggleTheme } = useThemeStore()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [progress, setProgress] = useState(35)
  const [mounted, setMounted] = useState(false)

  // Next.js Hydration Mismatch 방지 및 테마 클래스 적용 로직
  useEffect(() => {
    setMounted(true)
    // .dark 클래스 동기화
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-bg-base transition-colors duration-300">
      {/* Header Area: Day 및 테마 토글 */}
      <header className="flex justify-between items-center px-6 py-6 pt-[env(safe-area-inset-top)]">
        <div className="flex flex-col">
          <span className="text-text-secondary text-[10px] uppercase font-black tracking-widest leading-none mb-1">UNIT 01</span>
          <h1 className="text-2xl font-black text-text-primary tracking-tighter">Day 01</h1>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-3 bg-bg-surface border border-border-color rounded-xl text-text-primary shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all active:scale-95"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
        </button>
      </header>

      {/* Progress Bar Area: 네온 컬러 포인트 사용 */}
      <div className="px-6 mb-12">
        <div className="h-1.5 w-full bg-border-color rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="h-full bg-accent-neon"
          />
        </div>
        <div className="flex justify-between mt-2">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">Progress</span>
            <span className="text-[10px] font-black text-text-primary">{progress}%</span>
        </div>
      </div>

      {/* Main Content: 단어 카드 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm bg-bg-surface border border-border-color rounded-2xl p-8 shadow-sm relative overflow-hidden"
        >
          {/* Subtle Accent Bar */}
           <div className="absolute top-0 left-0 right-0 h-1 bg-accent-neon/30 dark:bg-accent-neon/10" />

          {/* Card Top: 품사 배지 및 북마크 */}
          <div className="flex justify-between items-start mb-10">
            <span className="px-3 py-1 bg-btn-secondary-bg text-btn-secondary-text text-[10px] font-black uppercase tracking-widest rounded-lg border border-border-color">
              {DEMO_WORD.partOfSpeech}
            </span>
            <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`transition-colors duration-300 ${isBookmarked ? 'text-accent-terra' : 'text-border-color hover:text-text-secondary'}`}
            >
              <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>
          </div>

          {/* Center: Word & Phonetic */}
          <div className="text-center mb-10">
            <h2 className="text-5xl font-black text-text-primary tracking-tighter mb-2 leading-none">{DEMO_WORD.word}</h2>
            <p className="text-text-secondary text-sm font-medium tracking-wide opacity-50">{DEMO_WORD.phonetic}</p>
          </div>

          {/* Meaning Section: Minimalist Box */}
          <div className="bg-bg-base/50 dark:bg-bg-base/20 rounded-xl p-5 border border-border-color/50 mb-6">
             <p className="text-xl font-bold text-text-primary leading-tight text-center">{DEMO_WORD.meaning}</p>
          </div>

          {/* Example Area */}
          <div className="px-2">
              <p className="text-sm font-medium text-text-secondary leading-relaxed italic text-center">
                  "{DEMO_WORD.example}"
              </p>
          </div>
        </motion.div>
      </main>

      {/* Footer Area: Bottom Action Buttons */}
      <footer className="px-8 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] flex gap-4 w-full max-w-md mx-auto">
        <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-btn-secondary-bg text-btn-secondary-text rounded-xl font-black text-lg border border-border-color shadow-sm active:scale-95 transition-all">
          <RotateCcw size={20} strokeWidth={3} />
          다시 보기
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-btn-primary-bg text-btn-primary-text rounded-xl font-black text-lg border border-text-primary shadow-sm active:scale-95 transition-all">
          <Check size={20} strokeWidth={3} />
          암기 완료
        </button>
      </footer>
    </div>
  )
}
