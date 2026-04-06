'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function RootPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      // 서비스 접속 시 첫 화면을 학습 설정 페이지로 변경
      router.push('/settings')
    }
    checkUser()
  }, [router, supabase])

  return (
    <div className="flex flex-col h-[100dvh] items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans">
      <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  )
}
