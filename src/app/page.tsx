'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // 로그인 체크 없이 바로 설정 페이지로 리다이렉션
    router.push('/settings')
  }, [router])

  return (
    <div className="flex flex-col h-[100dvh] items-center justify-center bg-background font-sans">
      <div className="w-12 h-12 border-4 border-border-base border-t-primary rounded-full animate-spin"></div>
    </div>
  )
}

