'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getFlatWords, WordItem } from '@/utils/words'
import { useSettingStore } from '@/store/settingStore'
import Flashcard from '@/components/Deck/Flashcard'
import CardControls from '@/components/Deck/CardControls'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { User } from '@supabase/supabase-js'

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
        studyList = allWords.filter(w => w.day?.endsWith(learningDay.toString()))
        studyList = studyList.filter(w => !statusMap.has(w.id))
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
  }, [targetScore, learningMode, learningDay, router])

  const handleSwipe = async (direction: 'left' | 'right' | 'up', wordId: number) => {
    let newStatus = 'unknown'
    if (direction === 'right') newStatus = 'memorized'
    if (direction === 'up') newStatus = 'confused'
    if (direction === 'left') newStatus = 'unknown'

    // Remove top card locally immediately
    setDeck(prev => prev.slice(1))

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
    <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans transition-colors">
      <header className="px-6 py-6 flex justify-between items-center z-10 w-full">
        <button 
          onClick={() => router.push('/')}
          className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className="text-sm font-bold px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 shadow-sm transition-colors">
              {deck.length} 단어 남음
            </span>
          )}
        </div>
      </header>
      
      <main className="flex-1 relative flex flex-col items-center justify-center px-6 -mt-10">
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
              onClick={() => router.push('/')}
              className="mt-6 w-full py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 active:scale-95 transition-all"
            >
              대시보드로 돌아가기
            </button>
          </div>
        )}
      </main>

      {/* Card Controls */}
      {user && deck.length > 0 && <CardControls onAction={(dir) => handleSwipe(dir, currentWord.id)} />}
    </div>
  )
}
