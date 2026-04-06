'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getFlatWords, WordItem } from '@/utils/words'
import { useSettingStore } from '@/store/settingStore'
import Flashcard from '@/components/Deck/Flashcard'
import CardControls from '@/components/Deck/CardControls'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import StudyTutorial from '@/components/Deck/StudyTutorial'

// Fisher-Yates Shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function StudyPage() {
  const router = useRouter()
  const supabase = createClient()
  const { targetScore, learningMode, learningDay } = useSettingStore()
  const [user, setUser] = useState<User | null>(null)
  
  const [deck, setDeck] = useState<WordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [totalDayCount, setTotalDayCount] = useState(0)
  const [memorizedCount, setMemorizedCount] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenStudyTutorial')
    if (!hasSeen) {
      setShowTutorial(true)
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

      // Fetch user specific word status
      const { data: statusData } = await supabase
        .from('user_word_status')
        .select('word_id, status')
        .eq('user_id', session.user.id)

      const statusMap = new Map()
      statusData?.forEach((item) => {
        statusMap.set(item.word_id, item.status)
      })

      let allWords = getFlatWords()

      // 공통: 목표점수에 의한 필터링 (600/900)
      if (targetScore) {
        allWords = allWords.filter((w) => w.grade?.includes(targetScore.toString()))
      }

      let studyList: WordItem[] = []

      // 학습 모드별 데이터 필터링
      if (learningMode === 'day') {
        // 날짜별 (선택된 Day의 단어 중 데이터에 기록되지 않은 미학습 단어만 노출)
        studyList = allWords.filter(w => w.day === `Day ${learningDay}`)
        
        // 날짜별 학습일 때 전체 개수 산정
        const dayWords = allWords.filter(w => w.day === `Day ${learningDay}`)
        setTotalDayCount(dayWords.length)
        const memorizedInDay = dayWords.filter(w => statusMap.get(w.id) === 'memorized').length
        setMemorizedCount(memorizedInDay)

        studyList = studyList.filter(w => statusMap.get(w.id) !== 'memorized')
      } 
      else if (learningMode === 'random') {
        // 랜덤: 모든 단어 중 기록되지 않은 미학습 단어만 섞은 후, 최대 50개(청크) 로드
        let notMemorized = allWords.filter(w => !statusMap.has(w.id))
        notMemorized = shuffleArray(notMemorized)
        studyList = notMemorized.slice(0, 50)
      } 
      else if (learningMode === 'review') {
        // 오답 복습: statusMap 기준으로 'unknown'이거나 'confused'인 단어로 로드
        studyList = allWords.filter(w => statusMap.get(w.id) === 'unknown' || statusMap.get(w.id) === 'confused')
      }

      setDeck(studyList)
      setLoading(false)
    }

    fetchUserAndData()
  }, [targetScore, learningMode, learningDay, router, supabase])

  const handleSwipe = async (direction: 'left' | 'right' | 'up', wordId: number) => {
    let newStatus = 'unknown'
    if (direction === 'right') newStatus = 'memorized'
    if (direction === 'up') newStatus = 'confused'
    if (direction === 'left') newStatus = 'unknown'

    // Remove top card locally immediately
    if (direction === 'right') {
      setDeck(prev => prev.slice(1))
      setMemorizedCount(prev => prev + 1)
    } else {
      // '모름' 또는 '헷갈림'인 경우 카드를 맨 뒤로 보냄
      setDeck(prev => {
        const [current, ...rest] = prev
        return [...rest, current]
      })
    }

    if (user) {
      await supabase
        .from('user_word_status')
        .upsert({ 
          user_id: user.id, 
          word_id: wordId, 
          status: newStatus 
        }, { onConflict: 'user_id,word_id' })
    }
  }

  const currentWord = deck[0]

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans transition-colors pt-[env(safe-area-inset-top)]">
      <header className="px-6 py-2 flex justify-between items-center z-10 w-full shrink-0">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          {!loading && (
            <div className="relative">
              <button 
                onClick={() => setShowTooltip(!showTooltip)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95"
              >
                <span className="text-xs font-bold">
                  {learningMode === 'day' ? `${totalDayCount - memorizedCount} 단어 남음` : `${deck.length} 단어 남음`}
                </span>
                <HelpCircle size={14} className="text-gray-400" />
              </button>
              
              {/* Tooltip */}
              <AnimatePresence>
                {showTooltip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-10 right-0 w-48 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-xl shadow-xl z-50 pointer-events-none font-medium leading-relaxed"
                  >
                    {learningMode === 'day' 
                      ? `Day ${learningDay}에서 '완벽히 외움' 처리되지 않은 남은 단어 수입니다.` 
                      : "현재 학습 세션에 포함된 남은 단어 수입니다."}
                    <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 dark:bg-white rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 relative flex flex-col items-center justify-center px-6 min-h-0">
        {loading ? (
          <div className="animate-pulse flex flex-col items-center mt-20">
            <div className="w-12 h-12 border-4 border-gray-100 dark:border-gray-800 border-t-indigo-500 dark:border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="font-bold text-gray-400 dark:text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : deck.length > 0 ? (
          <AnimatePresence>
            <Flashcard 
              key={currentWord.id} 
              word={currentWord} 
              onSwipe={handleSwipe} 
            />
          </AnimatePresence>
        ) : (
          <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 max-w-sm w-full z-10 transition-colors">
            <span className="text-6xl mb-6 block">🎉</span>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">학습 완료!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">모든 단어를 완벽하게 숙지했습니다.</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-6 w-full py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 active:scale-95 transition-all"
            >
              대시보드로 돌아가기
            </button>
          </div>
        )}
      </main>

      {/* Card Controls */}
      {user && deck.length > 0 && <CardControls onAction={(dir) => handleSwipe(dir, currentWord.id)} />}

      {/* Onboarding Tutorial */}
      {showTutorial && (
        <StudyTutorial 
          onComplete={() => {
            localStorage.setItem('hasSeenStudyTutorial', 'true')
            setShowTutorial(false)
          }} 
        />
      )}
    </div>
  )
}
