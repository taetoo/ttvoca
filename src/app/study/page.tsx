'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getFlatWords, WordItem } from '@/utils/words'
import { useSettingStore } from '@/store/settingStore'
import Flashcard from '@/components/Deck/Flashcard'
import CardControls from '@/components/Deck/CardControls'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Trophy } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import StudyTutorial from '@/components/Deck/StudyTutorial'

export default function StudyPage() {
  const router = useRouter()
  const supabase = createClient()
  const { targetScore, learningMode, learningDay, studyRound, missedWords, resetStudySession } = useSettingStore()
  const [user, setUser] = useState<User | null>(null)
  
  const [deck, setDeck] = useState<WordItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [memorizedCount, setMemorizedCount] = useState(0)
  const [studyComplete, setStudyComplete] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  
  // TTS 오디오 레퍼런스
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 튜토리얼 첫 방문 체크 (V2: 새 학습 흐름 반영)
  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenStudyTutorialV2')
    if (!hasSeen) {
      setShowTutorial(true)
    }
  }, [])

  // TTS 정리 함수
  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      // 사용자별 단어 상태 조회
      const { data: statusData } = await supabase
        .from('user_word_status')
        .select('word_id, status')
        .eq('user_id', session.user.id)

      const statusMap = new Map<number, string>()
      statusData?.forEach((item) => {
        statusMap.set(item.word_id, item.status)
      })

      let allWords = getFlatWords()

      // 목표점수 필터
      if (targetScore) {
        allWords = allWords.filter((w) => w.grade?.includes(targetScore.toString()))
      }

      let studyList: WordItem[] = []

      if (learningMode === 'day') {
        const dayWords = allWords.filter(w => w.day === `Day ${learningDay}`)
        setTotalCount(dayWords.length)
        const memorized = dayWords.filter(w => statusMap.get(w.id) === 'memorized').length
        setMemorizedCount(memorized)
        // 미학습 단어만
        studyList = dayWords.filter(w => statusMap.get(w.id) !== 'memorized')
      } else if (learningMode === 'random') {
        const notMemorized = allWords.filter(w => !statusMap.has(w.id))
        // Fisher-Yates Shuffle
        for (let i = notMemorized.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [notMemorized[i], notMemorized[j]] = [notMemorized[j], notMemorized[i]]
        }
        studyList = notMemorized.slice(0, 50)
        setTotalCount(studyList.length)
      } else if (learningMode === 'review') {
        // missedWords가 있으면 그것을 사용하고, 없으면 DB에서 unknown 단어 조회
        if (missedWords.length > 0) {
          studyList = missedWords
        } else {
          studyList = allWords.filter(w => statusMap.get(w.id) === 'unknown')
        }
        setTotalCount(studyList.length)
      }

      setDeck(studyList)
      setCurrentIndex(0)
      setLoading(false)

      // 학습할 단어가 없으면 완료 상태로 설정
      if (studyList.length === 0) {
        setStudyComplete(true)
      }
    }

    fetchUserAndData()
  }, [targetScore, learningMode, learningDay, missedWords, router, supabase])

  /** 스와이프 네비게이션 (상태 저장 없이 이동만) */
  const handleSwipeNav = useCallback((direction: 'prev' | 'next') => {
    stopTTS()
    if (direction === 'next' && currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex, deck.length, stopTTS])

  /** 하단 버튼으로 상태 저장 후 다음 카드로 이동 */
  const handleStatusAction = async (status: 'unknown' | 'memorized') => {
    const currentWord = deck[currentIndex]
    if (!currentWord || !user) return

    stopTTS()

    // Supabase에 상태 저장
    await supabase
      .from('user_word_status')
      .upsert({
        user_id: user.id,
        word_id: currentWord.id,
        status,
      }, { onConflict: 'user_id,word_id' })

    // 외움 카운트 업데이트
    if (status === 'memorized') {
      setMemorizedCount(prev => prev + 1)
    }

    // 다음 카드 또는 완료
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // 모든 단어 학습 완료
      setStudyComplete(true)
    }
  }

  const currentWord = deck[currentIndex]
  const progress = totalCount > 0 ? (memorizedCount / totalCount) * 100 : 0

  return (
    <div className="flex flex-col h-[100dvh] bg-bg-base overflow-hidden font-sans transition-colors pt-[env(safe-area-inset-top)]">
      {/* 상단 헤더 */}
      <header className="px-6 py-4 flex justify-between items-center z-10 w-full shrink-0">
        <button 
          onClick={() => {
            stopTTS()
            router.push('/dashboard')
          }}
          className="p-3 -ml-2 text-text-primary bg-bg-surface border border-border-color rounded-xl shadow-sm active:scale-95 transition-all"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2">
          {!loading && !studyComplete && (
            <span className="text-xs font-black text-text-secondary bg-btn-secondary-bg px-4 py-2 rounded-xl border border-border-color tracking-tight">
              {currentIndex + 1} / {deck.length}
            </span>
          )}
        </div>
      </header>
      
      {/* 프로그레스 바 */}
      {!loading && !studyComplete && (
        <div className="px-6 mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-50">
              Progress
            </span>
            <span className="text-[10px] font-black text-accent-neon-text tracking-wider">
              {memorizedCount}/{totalCount} ({Math.round(progress)}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-border-color/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent-neon rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="flex-1 relative flex flex-col items-center justify-center px-6 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="animate-pulse flex flex-col items-center mt-20">
            <div className="w-16 h-16 border-4 border-border-color border-t-accent-neon rounded-full animate-spin mb-6" />
            <p className="font-black text-text-secondary uppercase tracking-widest text-sm opacity-50">Loading words...</p>
          </div>
        ) : studyComplete ? (
          /* 학습 완료 화면 */
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
        ) : currentWord && !showTutorial ? (
          <AnimatePresence mode="wait">
            <Flashcard 
              key={currentWord.id}
              word={currentWord} 
              round={studyRound}
              onSwipeNav={handleSwipeNav}
              audioRef={audioRef}
            />
          </AnimatePresence>
        ) : null}
      </main>

      {/* 하단 컨트롤 */}
      {user && !loading && !studyComplete && currentWord && (
        <CardControls onAction={handleStatusAction} />
      )}

      {/* 학습 튜토리얼 */}
      {showTutorial && (
        <StudyTutorial 
          onComplete={() => {
            localStorage.setItem('hasSeenStudyTutorialV2', 'true')
            setShowTutorial(false)
          }} 
        />
      )}
    </div>
  )
}
