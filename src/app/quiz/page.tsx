'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getFlatWords, WordItem } from '@/utils/words'
import { useSettingStore } from '@/store/settingStore'
import QuizCard from '@/components/Quiz/QuizCard'
import QuizTimer from '@/components/Quiz/QuizTimer'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Zap } from 'lucide-react'

/** Fisher-Yates Shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizPage() {
  const router = useRouter()
  const { targetScore, learningDay, addMissedWord, setQuizResults, setStudyPhase } = useSettingStore()

  const [quizWords, setQuizWords] = useState<WordItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [choices, setChoices] = useState<WordItem[]>([])
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [selectedAnswer, setSelectedAnswer] = useState<WordItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [timerKey, setTimerKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // 결과 추적
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  /** 데이터 로드 */
  useEffect(() => {
    if (!isMounted) return

    const fetchData = () => {
      let allWords = getFlatWords()

      // 목표점수 필터
      if (targetScore) {
        allWords = allWords.filter(w => w.grade?.includes(targetScore.toString()))
      }

      // 현재 Day 단어
      const dayWords = allWords.filter(w => w.day === `Day ${learningDay}`)
      const shuffled = shuffle(dayWords)
      setQuizWords(shuffled)
      setLoading(false)
    }

    fetchData()
  }, [targetScore, learningDay, isMounted])


  /** 현재 문제의 보기 생성 */
  useEffect(() => {
    if (quizWords.length === 0) return
    const current = quizWords[currentIndex]
    if (!current) return

    generateChoices(current)
  }, [currentIndex, quizWords])

  /** 같은 Day + 같은 pos 기반 오답 선지 생성 */
  const generateChoices = (correctWord: WordItem) => {
    // 같은 Day에서 정답 제외한 단어 목록
    const sameDayWords = quizWords.filter(w => w.id !== correctWord.id)
    
    // 같은 pos 우선 추출
    const samePos = sameDayWords.filter(w => w.pos === correctWord.pos)
    const otherPos = sameDayWords.filter(w => w.pos !== correctWord.pos)
    
    const pool = [...shuffle(samePos), ...shuffle(otherPos)]
    const wrongChoices = pool.slice(0, 2)
    
    // 정답 + 오답 2개를 섞음
    const allChoices = shuffle([correctWord, ...wrongChoices])
    setChoices(allChoices)
  }

  /** 정답 처리 */
  const handleAnswer = useCallback((selected: WordItem) => {
    if (feedbackState !== 'idle') return
    
    const current = quizWords[currentIndex]
    setSelectedAnswer(selected)

    if (selected.id === current.id) {
      // 정답
      setFeedbackState('correct')
      setCorrectCount(prev => prev + 1)
    } else {
      // 오답
      setFeedbackState('incorrect')
      setIncorrectCount(prev => prev + 1)
      addMissedWord(current)
    }

    // 1.5초 후 다음 문제로 이동
    setTimeout(() => {
      moveToNext()
    }, 1200)
  }, [feedbackState, currentIndex, quizWords])

  /** 시간 초과 처리 */
  const handleTimeUp = useCallback(() => {
    if (feedbackState !== 'idle') return
    
    const current = quizWords[currentIndex]
    setFeedbackState('incorrect')
    setIncorrectCount(prev => prev + 1)
    addMissedWord(current)

    setTimeout(() => {
      moveToNext()
    }, 1200)
  }, [feedbackState, currentIndex, quizWords])

  /** 다음 문제 이동 */
  const moveToNext = () => {
    setFeedbackState('idle')
    setSelectedAnswer(null)

    if (currentIndex < quizWords.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setTimerKey(prev => prev + 1) // 타이머 리셋
    } else {
      // 퀴즈 완료 → Review 페이지로 이동
      setStudyPhase('review')
      // 결과를 먼저 설정한 후 라우팅
      const finalCorrect = correctCount + (feedbackState === 'correct' ? 0 : 0)
      const finalIncorrect = incorrectCount + (feedbackState === 'incorrect' ? 0 : 0)
      setQuizResults({ correct: finalCorrect, incorrect: finalIncorrect })
      router.push('/review')
    }
  }

  const currentWord = quizWords[currentIndex]
  const progress = quizWords.length > 0 ? ((currentIndex + 1) / quizWords.length) * 100 : 0

  if (!isMounted) {
    return (
      <div className="flex flex-col h-[100dvh] bg-bg-base overflow-hidden font-sans justify-center items-center">
        <div className="w-16 h-16 border-4 border-border-color border-t-accent-neon rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-bg-base overflow-hidden font-sans transition-colors pt-[env(safe-area-inset-top)]">
      {/* 헤더 */}
      <header className="px-6 py-4 flex justify-between items-center z-10 w-full shrink-0">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-3 -ml-2 text-text-primary bg-bg-surface border border-border-color rounded-xl shadow-sm active:scale-95 transition-all"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-accent-neon-text" />
          <span className="text-xs font-black text-text-secondary tracking-tight">
            Quiz {currentIndex + 1} / {quizWords.length}
          </span>
        </div>
      </header>

      {/* 타이머 & 프로그레스 */}
      {!loading && currentWord && (
        <div className="px-6 mb-4 space-y-2">
          <QuizTimer 
            key={timerKey}
            duration={10} 
            onTimeUp={handleTimeUp} 
            isPaused={feedbackState !== 'idle'} 
          />
          <div className="w-full h-1 bg-border-color/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-neon/40 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* 메인 */}
      <main className="flex-1 relative flex flex-col items-center justify-center px-6 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="animate-pulse flex flex-col items-center mt-20">
            <div className="w-16 h-16 border-4 border-border-color border-t-accent-neon rounded-full animate-spin mb-6" />
            <p className="font-black text-text-secondary uppercase tracking-widest text-sm opacity-50">Loading quiz...</p>
          </div>
        ) : currentWord ? (
          <AnimatePresence mode="wait">
            <QuizCard
              key={currentWord.id}
              question={currentWord}
              choices={choices}
              onAnswer={handleAnswer}
              feedbackState={feedbackState}
              correctAnswer={currentWord}
            />
          </AnimatePresence>
        ) : null}

        {/* 피드백 오버레이 */}
        <AnimatePresence>
          {feedbackState === 'correct' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-accent-neon text-black rounded-xl font-black text-sm shadow-lg z-30"
            >
              정답! 🎉
            </motion.div>
          )}
          {feedbackState === 'incorrect' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-accent-terra text-white rounded-xl font-black text-sm shadow-lg z-30"
            >
              오답 ❌
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
