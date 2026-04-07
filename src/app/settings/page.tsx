'use client'

import { useRouter } from 'next/navigation'
import { Target, Moon, Sun, Monitor, LogOut, User, RotateCcw } from 'lucide-react'
import { useSettingStore } from '@/store/settingStore'
import { useVocaStore } from '@/store/useVocaStore'
import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'

export default function SettingsPage() {
  const { targetScore, setTargetScore, theme, setTheme } = useSettingStore()
  const resetProgress = useVocaStore((state) => state.resetProgress)
  const router = useRouter()
  const supabase = createClient()
  const [isResetting, setIsResetting] = useState(false)
  const [profile, setProfile] = useState<{nickname: string} | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          console.error("Profile Fetch Error:", profileError)
        } else if (profileData) {
          setProfile(profileData)
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    fetchUserData()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleResetData = async () => {
    if (!confirm('경고: 모든 학습 기록(외운 단어, 못 외운 단어 등)이 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
      return
    }

    setIsResetting(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { error } = await supabase
        .from('user_word_status')
        .delete()
        .eq('user_id', session.user.id)
      
      if (error) {
        console.error("Delete Error:", error)
        alert(`학습 기록 초기화 중 오류가 발생했습니다. (Supabase 보안 정책에 DELETE 권한을 추가해주세요!) 에러명: ${error.message}`)
      } else {
        // 프론트 화면 전역 상태 동기화 (진행률 초기화)
        resetProgress()
        alert('학습 기록이 성공적으로 초기화되었습니다.')
      }
    } else {
      alert('로그인이 필요합니다.')
    }
    setIsResetting(false)
  }

  const handleStart = () => {
    if (!targetScore) {
      alert('목표 점수를 선택해주세요.')
      return
    }
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background font-sans">
        <div className="w-12 h-12 border-4 border-border-base border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-base px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(8rem+env(safe-area-inset-bottom))] font-sans text-text-primary transition-colors">
      <h1 className="text-4xl font-black mb-10 tracking-tighter">설정</h1>

      <div className="space-y-12">
        {/* Simplified Welcome Section */}
        <div className="mb-2 px-1">
          <p className="text-text-secondary font-black text-[10px] mb-1 uppercase tracking-widest opacity-60">Welcome back</p>
          <h2 className="text-3xl font-black text-text-primary leading-none">
            안녕하세요, <span className="text-accent-neon-text tracking-tight">{profile?.nickname || '회원'}</span>님!
          </h2>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Monitor className="text-accent-neon-text" size={20} strokeWidth={2.5} />
            <h2 className="text-lg font-black uppercase tracking-tight">화면 테마</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`py-4 rounded-xl font-black text-[10px] border transition-all flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'border-accent-neon bg-accent-neon text-black shadow-sm'
                  : 'border-border-color bg-bg-surface text-text-secondary opacity-60'
              }`}
            >
              <Sun size={18} strokeWidth={2.5} />
              라이트
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`py-4 rounded-xl font-black text-[10px] border transition-all flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'border-accent-neon bg-accent-neon text-black shadow-sm'
                  : 'border-border-color bg-bg-surface text-text-secondary opacity-60'
              }`}
            >
              <Moon size={18} strokeWidth={2.5} />
              다크
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`py-4 rounded-xl font-black text-[10px] border transition-all flex flex-col items-center gap-2 ${
                theme === 'system'
                  ? 'border-accent-neon bg-accent-neon text-black shadow-sm'
                  : 'border-border-color bg-bg-surface text-text-secondary opacity-60'
              }`}
            >
              <Monitor size={18} strokeWidth={2.5} />
              시스템
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Target className="text-accent-terra" size={20} strokeWidth={2.5} />
            <h2 className="text-lg font-black uppercase tracking-tight">목표 점수</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTargetScore(600)}
              className={`py-6 rounded-xl font-black text-xl border transition-all ${
                targetScore === 600
                  ? 'border-accent-terra bg-accent-terra text-white shadow-sm'
                  : 'border-border-color bg-bg-surface text-text-secondary opacity-40'
              }`}
            >
              600+
            </button>
            <button
              onClick={() => setTargetScore(900)}
              className={`py-6 rounded-xl font-black text-xl border transition-all ${
                targetScore === 900
                  ? 'border-accent-terra bg-accent-terra text-white shadow-sm'
                  : 'border-border-color bg-bg-surface text-text-secondary opacity-40'
              }`}
            >
              900+
            </button>
          </div>
        </section>


        <section>
          <div className="flex items-center gap-2 mb-6">
            <User className="text-accent-neon-text" size={20} strokeWidth={2.5} />
            <h2 className="text-lg font-black uppercase tracking-tight">계정 및 데이터</h2>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/settings/account')}
              className="w-full py-4 rounded-xl font-black text-lg border border-border-color bg-bg-surface text-text-primary shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Shield size={20} strokeWidth={2.5} />
              프로필 관리
            </button>
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="w-full py-4 rounded-xl font-black text-lg border border-border-color bg-bg-surface text-accent-terra shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <RotateCcw size={20} strokeWidth={2.5} className={isResetting ? 'animate-spin' : ''} />
              {isResetting ? '초기화 중...' : '학습 데이터 초기화'}
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-xl font-black text-lg border border-border-color bg-bg-base text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={20} strokeWidth={2.5} />
              로그아웃
            </button>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pt-12 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-bg-base to-transparent pointer-events-none">
        <button
          onClick={handleStart}
          className="w-full py-5 bg-btn-primary-bg text-btn-primary-text rounded-xl border border-btn-primary-bg font-black text-xl shadow-sm active:scale-95 transition-all pointer-events-auto"
        >
          학습 시작하기
        </button>
      </div>
    </div>
  )
}
