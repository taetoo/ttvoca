'use client'

import { useRouter } from 'next/navigation'
import { Target, Moon, Sun, Monitor, LogOut, User, RotateCcw } from 'lucide-react'
import { useSettingStore } from '@/store/settingStore'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export default function SettingsPage() {
  const { targetScore, setTargetScore, theme, setTheme } = useSettingStore()
  const router = useRouter()
  const supabase = createClient()

  const [isResetting, setIsResetting] = useState(false)

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
      await supabase
        .from('user_word_status')
        .delete()
        .eq('user_id', session.user.id)
      
      alert('학습 기록이 성공적으로 초기화되었습니다.')
    }
    setIsResetting(false)
  }

  const handleStart = () => {
    if (!targetScore) {
      alert('목표 점수를 선택해주세요.')
      return
    }
    router.push('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 px-6 pt-12 pb-24 font-sans text-gray-900 dark:text-gray-100 transition-colors">
      <h1 className="text-3xl font-extrabold mb-8">학습 설정</h1>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="text-indigo-500" />
            <h2 className="text-xl font-bold">화면 테마</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`py-3 rounded-2xl font-bold text-sm border-2 transition-all flex flex-col items-center gap-1 ${
                theme === 'light'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Sun size={20} />
              라이트
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`py-3 rounded-2xl font-bold text-sm border-2 transition-all flex flex-col items-center gap-1 ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Moon size={20} />
              다크
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`py-3 rounded-2xl font-bold text-sm border-2 transition-all flex flex-col items-center gap-1 ${
                theme === 'system'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Monitor size={20} />
              시스템
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-red-500" />
            <h2 className="text-xl font-bold">목표 점수</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTargetScore(600)}
              className={`py-5 rounded-2xl font-bold text-lg border-2 transition-all ${
                targetScore === 600
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              600점 이상
            </button>
            <button
              onClick={() => setTargetScore(900)}
              className={`py-5 rounded-2xl font-bold text-lg border-2 transition-all ${
                targetScore === 900
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              900점 이상
            </button>
          </div>
        </section>


        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="text-emerald-500" />
            <h2 className="text-xl font-bold">계정 및 데이터 관리</h2>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="w-full py-4 rounded-2xl font-bold text-lg border-2 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RotateCcw size={20} className={isResetting ? 'animate-spin' : ''} />
              {isResetting ? '초기화 중...' : '모든 학습 기록 초기화'}
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              로그아웃
            </button>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent pointer-events-none">
        <button
          onClick={handleStart}
          className="w-full py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl font-bold text-lg shadow-lg hover:bg-gray-800 dark:hover:bg-white active:scale-95 transition-all pointer-events-auto"
        >
          학습 시작하기
        </button>
      </div>
    </div>
  )
}
