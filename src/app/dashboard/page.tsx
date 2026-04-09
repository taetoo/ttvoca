'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useSettingStore } from '@/store/settingStore'
import BottomNavBar from '@/components/Navigation/BottomNavBar'
import { Settings, Calendar, Shuffle, AlertCircle, Play, Trophy, CheckCircle2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { fetchUserStats, UserStats } from '@/utils/stats'
import ContextualTutorial, { TutorialStep } from '@/components/Common/ContextualTutorial'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { targetScore, learningMode, learningDay, setLearningMode, setLearningDay, resetStudySession } = useSettingStore()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)

  const dashboardSteps: TutorialStep[] = [
    {
      targetId: 'stats-card',
      title: '학습 성취도',
      content: '설정한 목표 점수 단어들을 얼마나 외웠는지 한눈에 보여줍니다. 100%를 향해 달려보세요!',
      position: 'bottom'
    },
    {
      targetId: 'mode-selector',
      title: '다양한 학습 모드',
      content: '날짜별, 무작위, 또는 틀린 단어 복습 중 원하는 방식을 선택할 수 있습니다.',
      position: 'top'
    }
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      
      // 통계 데이터 가져오기
      if (targetScore) {
        const userStats = await fetchUserStats(session.user.id, targetScore)
        setStats(userStats)
      }
      
      setLoading(false)
    }
    checkUser()
  }, [router, supabase, targetScore])

  const handleStart = () => {
    if (!targetScore) {
      alert('설정(Settings) 탭에서 먼저 목표 점수를 선택해주세요!')
      return
    }
    resetStudySession()
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
    <div className="flex flex-col h-[100dvh] bg-bg-base text-text-primary overflow-hidden font-sans transition-colors pt-[env(safe-area-inset-top)]">
      <header className="px-6 py-8 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tighter">TTVOCA</h1>
          <p className="text-[10px] font-black text-text-secondary tracking-widest uppercase opacity-60 mt-0.5">Fast words, High scores</p>
        </div>
        <button 
          onClick={() => router.push('/settings')} 
          className="p-3 bg-bg-surface rounded-xl border border-border-color text-text-primary shadow-sm active:scale-95 transition-all"
          aria-label="설정"
        >
          <Settings size={20} strokeWidth={2.5} />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto px-6 py-4 pb-48">
        {/* Statistics Section */}
        {targetScore && stats && (
          <motion.div 
            id="stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 bg-bg-surface border border-border-color rounded-2xl shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Trophy size={80} strokeWidth={2.5} />
            </div>
            
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60 mb-1">Total Progress</p>
                <h2 className="text-3xl font-black text-foreground tracking-tighter">
                  {targetScore}+ <span className="text-accent-neon-text">Goal</span>
                </h2>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-accent-neon-text">{stats.progress}%</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-full h-3 bg-bg-base rounded-full border border-border-color overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-accent-neon shadow-[0_0_15px_rgba(206,246,112,0.3)]"
                />
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                <div className="flex items-center gap-1.5 text-accent-neon-text">
                  <CheckCircle2 size={12} strokeWidth={3} />
                  <span>{stats.memorizedCount} Memorized</span>
                </div>
                <div className="text-text-secondary opacity-60">
                  <span>{stats.totalCount} Total Words</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">학습 모드</h2>
          <p className="text-xs font-bold text-text-secondary opacity-70 italic">어떻게 공부하고 싶으신가요?</p>
        </div>

        <div className="space-y-4">
          {/* Day By Day */}
          <div 
            onClick={() => setLearningMode('day')}
            className={`cursor-pointer p-6 rounded-xl border transition-all relative overflow-hidden ${
              learningMode === 'day' 
                ? 'border-accent-neon bg-accent-neon text-black shadow-sm' 
                : 'border-border-color bg-bg-surface'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg border ${learningMode === 'day' ? 'bg-black/10 border-black/20 text-black' : 'bg-bg-base border-border-color text-text-secondary'}`}>
                <Calendar size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-black mb-1 ${learningMode === 'day' ? 'text-black' : 'text-text-primary'}`}>날짜별 순차 학습</h3>
                <p className={`text-sm font-bold leading-tight ${learningMode === 'day' ? 'text-black/70' : 'text-text-secondary'}`}>지정된 일차의 미학습 새 단어들을 학습합니다.</p>
                
                {/* Day Slider */}
                {learningMode === 'day' && (
                  <div className="mt-6 pt-6 border-t border-black/10" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-black uppercase tracking-wider opacity-60">학습할 Day 선택</span>
                      <span className="px-3 py-1 bg-black text-white font-black text-xs rounded-lg">Day {learningDay}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={learningDay}
                      onChange={(e) => setLearningDay(Number(e.target.value))}
                      className="w-full h-1.5 bg-black/20 rounded-lg appearance-none cursor-pointer accent-black transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Random Mix */}
          <div 
            onClick={() => setLearningMode('random')}
            className={`cursor-pointer p-6 rounded-xl border transition-all ${
              learningMode === 'random' 
                ? 'border-accent-neon bg-accent-neon text-black shadow-sm' 
                : 'border-border-color bg-bg-surface'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg border ${learningMode === 'random' ? 'bg-black/10 border-black/20 text-black' : 'bg-bg-base border-border-color text-text-secondary'}`}>
                <Shuffle size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-black mb-1 ${learningMode === 'random' ? 'text-black' : 'text-text-primary'}`}>전체 랜덤 믹스</h3>
                <p className={`text-sm font-bold leading-tight ${learningMode === 'random' ? 'text-black/70' : 'text-text-secondary'}`}>전체 미학습 단어를 무작위로 뽑아 학습합니다.</p>
              </div>
            </div>
          </div>

          {/* Review Mode */}
          <div 
            onClick={() => setLearningMode('review')}
            className={`cursor-pointer p-6 rounded-xl border transition-all ${
              learningMode === 'review' 
                ? 'border-accent-neon bg-accent-neon text-black shadow-sm' 
                : 'border-border-color bg-bg-surface'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg border ${learningMode === 'review' ? 'bg-black/10 border-black/20 text-black' : 'bg-bg-base border-border-color text-text-secondary'}`}>
                <AlertCircle size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-black mb-1 ${learningMode === 'review' ? 'text-black' : 'text-text-primary'}`}>오답 집중 복습</h3>
                <p className={`text-sm font-bold leading-tight ${learningMode === 'review' ? 'text-black/70' : 'text-text-secondary'}`}>모름으로 표시한 단어들을 재학습합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Start Button Fixed at Bottom */}
      <div className="fixed bottom-[110px] left-0 right-0 px-6 z-20 pointer-events-none pb-4">
        <button 
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 py-5 bg-btn-primary-bg text-btn-primary-text rounded-xl border border-btn-primary-bg font-black text-xl shadow-sm active:scale-95 transition-all pointer-events-auto"
        >
          <Play fill="currentColor" size={24} />
          학습 시작하기
        </button>
      </div>

      <BottomNavBar currentTab="home" />

      <ContextualTutorial 
        steps={dashboardSteps} 
        storageKey="hasSeenDashboardGuide"
        onComplete={() => {}} 
      />
    </div>
  )
}
