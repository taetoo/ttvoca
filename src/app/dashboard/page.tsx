'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useSettingStore } from '@/store/settingStore'
import BottomNavBar from '@/components/Navigation/BottomNavBar'
import { Settings, Calendar, Shuffle, AlertCircle, Play } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { targetScore, learningMode, learningDay, setLearningMode, setLearningDay } = useSettingStore()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      setLoading(false)
    }
    checkUser()
  }, [router, supabase])

  const handleStart = () => {
    if (!targetScore) {
      alert('설정(Settings) 탭에서 먼저 목표 점수를 선택해주세요!')
      return
    }
    router.push('/study')
  }

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans transition-colors pt-[env(safe-area-inset-top)]">
      <header className="px-6 py-4 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">TTVOCA</h1>
          <p className="text-[10px] font-bold text-[#DD7553] tracking-wider uppercase opacity-80 mt-0.5">Fast words, High scores</p>
        </div>
        <button 
          onClick={() => router.push('/settings')} 
          className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="설정"
        >
          <Settings size={20} />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto px-6 py-4 pb-48">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">학습 모드 선택</h2>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">원하는 학습 방식을 선택하고 시작하세요.</p>
        </div>

        <div className="space-y-4">
          {/* Day By Day */}
          <div 
            onClick={() => setLearningMode('day')}
            className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all ${
              learningMode === 'day' 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-transparent bg-white dark:bg-gray-900 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${learningMode === 'day' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                <Calendar size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-1 ${learningMode === 'day' ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100'}`}>날짜별 순차 학습</h3>
                <p className={`text-sm font-medium ${learningMode === 'day' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>지정된 일차의 확인하지 않은(미학습) 새 단어들을 학습합니다.</p>
                
                {/* Day Slider */}
                {learningMode === 'day' && (
                  <div className="mt-6 pt-4 border-t border-indigo-200 dark:border-indigo-800" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">학습할 Day 선택</span>
                      <span className="px-3 py-1 bg-indigo-500 text-white font-black text-sm rounded-full">Day {learningDay}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={learningDay}
                      onChange={(e) => setLearningDay(Number(e.target.value))}
                      className="w-full h-2 bg-indigo-200 dark:bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Random Mix */}
          <div 
            onClick={() => setLearningMode('random')}
            className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all ${
              learningMode === 'random' 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                : 'border-transparent bg-white dark:bg-gray-900 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${learningMode === 'random' ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                <Shuffle size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-1 ${learningMode === 'random' ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-900 dark:text-gray-100'}`}>전체 랜덤 믹스</h3>
                <p className={`text-sm font-medium ${learningMode === 'random' ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400'}`}>전체 미학습 단어 중 최대 50개를 무작위로 뽑아 학습합니다.</p>
              </div>
            </div>
          </div>

          {/* Review Mode */}
          <div 
            onClick={() => setLearningMode('review')}
            className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all ${
              learningMode === 'review' 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-transparent bg-white dark:bg-gray-900 shadow-sm hover:border-red-200 dark:hover:border-red-800'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${learningMode === 'review' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-1 ${learningMode === 'review' ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-gray-100'}`}>오답 집중 복습</h3>
                <p className={`text-sm font-medium ${learningMode === 'review' ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>과거에 모름/헷갈림으로 표시한 단어들을 모아서 재학습합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Start Button Fixed at Bottom */}
      <div className="fixed bottom-[110px] left-0 right-0 px-6 z-20 pointer-events-none bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent pt-12 pb-2">
        <button 
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-800 dark:hover:bg-white active:scale-[0.98] transition-all pointer-events-auto"
        >
          <Play fill="currentColor" size={20} />
          학습 시작하기
        </button>
      </div>

      <BottomNavBar currentTab="home" />
    </div>
  )
}
