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
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-background font-sans">
        <div className="w-12 h-12 border-4 border-border-base border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden font-sans transition-colors pt-[env(safe-area-inset-top)]">
      <header className="px-6 py-8 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter">TTVOCA</h1>
          <p className="text-[10px] font-black text-secondary tracking-widest uppercase opacity-90 mt-0.5">Fast words, High scores</p>
        </div>
        <button 
          onClick={() => router.push('/settings')} 
          className="p-3 bg-surface rounded-xl border-2 border-foreground text-foreground shadow-[3px_3px_0px_0px_#1E1E1E] dark:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          aria-label="설정"
        >
          <Settings size={20} />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto px-6 py-4 pb-48">
        <div className="mb-10">
          <h2 className="text-4xl font-black text-foreground mb-2 leading-none">학습 모드</h2>
          <p className="text-sm font-bold text-text-secondary opacity-70">원하는 학습 방식을 선택하고 시작하세요.</p>
        </div>

        <div className="space-y-6">
          {/* Day By Day */}
          <div 
            onClick={() => setLearningMode('day')}
            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${
              learningMode === 'day' 
                ? 'border-foreground bg-primary shadow-[4px_4px_0px_0px_#1E1E1E] dark:shadow-none' 
                : 'border-border-base bg-surface'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border-2 border-foreground ${learningMode === 'day' ? 'bg-white text-[#1E1E1E]' : 'bg-background text-text-secondary'}`}>
                <Calendar size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-black mb-1 ${learningMode === 'day' ? 'text-[#1E1E1E]' : 'text-foreground'}`}>날짜별 순차 학습</h3>
                <p className={`text-sm font-bold leading-tight ${learningMode === 'day' ? 'text-[#1E1E1E] opacity-70' : 'text-text-secondary opacity-80'}`}>지정된 일차의 미학습 새 단어들을 학습합니다.</p>
                
                {/* Day Slider */}
                {learningMode === 'day' && (
                  <div className="mt-6 pt-6 border-t-2 border-[#1E1E1E]/10" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-[#1E1E1E] uppercase tracking-wider">학습할 Day 선택</span>
                      <span className="px-3 py-1 bg-white border-2 border-[#1E1E1E] text-[#1E1E1E] font-black text-xs rounded-lg shadow-[2px_2px_0px_0px_#1E1E1E]">Day {learningDay}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={learningDay}
                      onChange={(e) => setLearningDay(Number(e.target.value))}
                      className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#1E1E1E] transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Random Mix */}
          <div 
            onClick={() => setLearningMode('random')}
            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${
              learningMode === 'random' 
                ? 'border-foreground bg-primary shadow-[4px_4px_0px_0px_#1E1E1E] dark:shadow-none' 
                : 'border-border-base bg-surface'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border-2 border-foreground ${learningMode === 'random' ? 'bg-white text-[#1E1E1E]' : 'bg-background text-text-secondary'}`}>
                <Shuffle size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-black mb-1 ${learningMode === 'random' ? 'text-[#1E1E1E]' : 'text-foreground'}`}>전체 랜덤 믹스</h3>
                <p className={`text-sm font-bold leading-tight ${learningMode === 'random' ? 'text-[#1E1E1E] opacity-70' : 'text-text-secondary opacity-80'}`}>전체 미학습 단어를 무작위로 뽑아 학습합니다.</p>
              </div>
            </div>
          </div>

          {/* Review Mode */}
          <div 
            onClick={() => setLearningMode('review')}
            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${
              learningMode === 'review' 
                ? 'border-foreground bg-primary shadow-[4px_4px_0px_0px_#1E1E1E] dark:shadow-none' 
                : 'border-border-base bg-surface'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border-2 border-foreground ${learningMode === 'review' ? 'bg-white text-[#1E1E1E]' : 'bg-background text-text-secondary'}`}>
                <AlertCircle size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-black mb-1 ${learningMode === 'review' ? 'text-[#1E1E1E]' : 'text-foreground'}`}>오답 집중 복습</h3>
                <p className={`text-sm font-bold leading-tight ${learningMode === 'review' ? 'text-[#1E1E1E] opacity-70' : 'text-text-secondary opacity-80'}`}>모름/헷갈림으로 표시한 단어들을 재학습합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Start Button Fixed at Bottom */}
      <div className="fixed bottom-[110px] left-0 right-0 px-6 z-20 pointer-events-none pb-4">
        <button 
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-[#1E1E1E] rounded-2xl border-4 border-[#1E1E1E] font-black text-xl shadow-[6px_6px_0px_0px_#1E1E1E] dark:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-[0.98] transition-all pointer-events-auto"
        >
          <Play fill="currentColor" size={24} />
          학습 시작하기
        </button>
      </div>

      <BottomNavBar currentTab="home" />
    </div>
  )
}
