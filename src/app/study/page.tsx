'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getFlatWords, WordItem } from '@/utils/words'
import { useSettingStore } from '@/store/settingStore'
import { useWordStatusStore } from '@/store/wordStatusStore'
import Flashcard from '@/components/Deck/Flashcard'
import CardControls from '@/components/Deck/CardControls'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Trophy } from 'lucide-react'
import ContextualTutorial, { TutorialStep } from '@/components/Common/ContextualTutorial'

export default function StudyPage() {
  const router = useRouter()
  const { targetScore, learningMode, learningDay, studyRound, missedWords, resetStudySession } = useSettingStore()
  const setStatus = useWordStatusStore((state) => state.setStatus)
  
  const [deck, setDeck] = useState<WordItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [memorizedCount, setMemorizedCount] = useState(0)
  const [studyComplete, setStudyComplete] = useState(false)
  const [isTutorialActive, setIsTutorialActive] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenStudyGuideV4')
    if (!hasSeen) {
      setIsTutorialActive(true)
    }
    setIsMounted(true)
  }, [])

  const studySteps: TutorialStep[] = [
    {
      targetId: 'center', // 중앙 모달 방식
      title: '단어 둘러보기',
      content: '카드를 터치하면 뜻을 볼 수 있고, 좌우로 스와이프하면 이전/다음 단어를 가볍게 훑어볼 수 있습니다.',
      position: 'center'
    },
    {
      targetId: 'center', // 중앙 모달 방식
      title: '학습 상태 저장',
      content: '암기 상태를 확정하려면 하단 버튼을 눌러주세요. 버튼을 눌러야만 학습 데이터가 안전하게 저장됩니다.',
      position: 'center'
    }
  ];
  
  // TTS 오디오 레퍼런스
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // TTS 정리 함수
  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const fetchLocalData = () => {
      // 로컬 스토어에서 상태 조회
      const statuses = useWordStatusStore.getState().statuses

      let allWords = getFlatWords()

      // 목표점수 필터
      if (targetScore) {
        allWords = allWords.filter((w) => w.grade?.includes(targetScore.toString()))
      }

      let studyList: WordItem[] = []

      if (learningMode === 'day') {
        const dayWords = allWords.filter(w => w.day === `Day ${learningDay}`)
        setTotalCount(dayWords.length)
        const memorized = dayWords.filter(w => statuses[w.id] === 'memorized').length
        setMemorizedCount(memorized)
        // 미학습 단어만
        studyList = dayWords.filter(w => statuses[w.id] !== 'memorized')
      } else if (learningMode === 'random') {
        const notMemorized = allWords.filter(w => statuses[w.id] !== 'memorized')
        // Fisher-Yates Shuffle
        for (let i = notMemorized.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [notMemorized[i], notMemorized[j]] = [notMemorized[j], notMemorized[i]]
        }
        studyList = notMemorized.slice(0, 50)
        setTotalCount(studyList.length)
      } else if (learningMode === 'review') {
        if (missedWords && missedWords.length > 0) {
          studyList = missedWords
        } else {
          studyList = allWords.filter(w => statuses[w.id] === 'unknown')
        }
        setTotalCount(studyList.length)
      }

      setDeck(studyList)
      if (studyList.length === 0) {
        setStudyComplete(true)
      }
      setLoading(false)
    }

    fetchLocalData()
  }, [isMounted, targetScore, learningMode, learningDay, missedWords])

  const currentWord = deck[currentIndex]

  // 상태 변경 함수
  const handleStatusAction = async (status: 'memorized' | 'unknown') => {
    if (!currentWord) return

    stopTTS()

    const savedWord = currentWord; // 로컬 저장용

    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1)
      if (status === 'memorized') {
        setMemorizedCount(prev => prev + 1)
      }
    } else {
      if (status === 'memorized') {
        setMemorizedCount(prev => prev + 1)
      }
      setStudyComplete(true)
    }

    // 로컬 스토어에 상태 업데이트
    setStatus(savedWord.id, status)
  }

  const handleSwipeNav = (direction: 'prev' | 'next') => {
    stopTTS()
    if (direction === 'next' && currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col h-[100dvh] bg-bg-base text-text-primary overflow-hidden font-sans pt-[env(safe-area-inset-top)] justify-center items-center">
        <div className="w-16 h-16 border-4 border-border-color border-t-accent-neon rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-bg-base text-text-primary overflow-hidden font-sans transition-colors pt-[env(safe-area-inset-top)]">
      {/* 상단 헤더 */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border-color">
        <button 
          onClick={() => {
            stopTTS()
            router.back()
          }}
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">
            {learningMode === 'day' ? `Day ${learningDay}` : learningMode === 'random' ? 'Random Mix' : 'Review Mode'}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-32 bg-bg-surface rounded-full overflow-hidden border border-border-color">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalCount > 0 ? (memorizedCount / totalCount) * 100 : 0}%` }}
                className="h-full bg-accent-neon shadow-[0_0_10px_rgba(206,246,112,0.3)]"
              />
            </div>
            <span className="text-[10px] font-black text-text-primary">
              {memorizedCount}/{totalCount}
            </span>
          </div>
        </div>
        
        <div className="w-10 h-10 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent-neon animate-pulse" />
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 relative flex flex-col items-center justify-center px-6 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="animate-pulse flex flex-col items-center mt-20">
            <div className="w-16 h-16 border-4 border-border-color border-t-accent-neon rounded-full animate-spin mb-6" />
            <p className="font-black text-text-secondary uppercase tracking-widest text-sm opacity-50">Loading words...</p>
          </div>
        ) : studyComplete ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-bg-surface border border-border-color rounded-xl shadow-sm max-w-sm w-full"
          >
            <div className="w-16 h-16 bg-accent-neon/10 border border-accent-neon/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={28} className="text-accent-neon-text" />
            </div>
            <h2 className="text-2xl font-black text-text-primary mb-2 tracking-tight">학습 완료!</h2>
            <p className="text-sm font-semibold text-text-secondary mb-8 leading-relaxed">
              모든 단어를 학습했습니다.<br />퀴즈로 실력을 확인해 보세요!
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  router.push('/quiz')
                }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-accent-neon text-black rounded-xl font-black text-base active:scale-95 transition-all"
              >
                <Sparkles size={18} />
                퀴즈 시작하기
              </button>
              <button 
                onClick={() => {
                  resetStudySession()
                  router.push('/dashboard')
                }}
                className="w-full py-4 bg-btn-secondary-bg text-text-primary border border-border-color rounded-xl font-black text-base active:scale-95 transition-all"
              >
                홈으로 돌아가기
              </button>
            </div>
          </motion.div>
        ) : currentWord ? (
          <AnimatePresence mode="wait">
            <div id="study-flashcard" className="w-full flex items-center justify-center">
              <Flashcard 
                key={currentWord.id}
                word={currentWord} 
                round={studyRound}
                onSwipeNav={handleSwipeNav}
                audioRef={audioRef}
                preventAutoPlay={isTutorialActive}
              />
            </div>
          </AnimatePresence>
        ) : null}
      </main>

      {/* 하단 컨트롤 */}
      {!loading && !studyComplete && currentWord && (
        <div id="study-controls" className="w-full">
          <CardControls onAction={handleStatusAction} />
        </div>
      )}

      <ContextualTutorial 
        steps={studySteps} 
        storageKey="hasSeenStudyGuideV4"
        onComplete={() => setIsTutorialActive(false)} 
      />
    </div>
  )
}


