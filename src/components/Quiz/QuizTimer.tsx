'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface QuizTimerProps {
  duration: number // 초 단위
  onTimeUp: () => void
  isPaused: boolean
}

export default function QuizTimer({ duration, onTimeUp, isPaused }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  // 문제 변경 시 타이머 리셋
  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, isPaused, onTimeUp])

  const progress = (timeLeft / duration) * 100
  const isWarning = timeLeft <= 3

  return (
    <div className="flex items-center gap-3">
      {/* 타이머 바 */}
      <div className="flex-1 h-1.5 bg-border-color/30 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${
            isWarning ? 'bg-accent-terra' : 'bg-accent-neon'
          }`}
          initial={{ width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* 초 표시 */}
      <span className={`text-sm font-black min-w-[2rem] text-right tabular-nums transition-colors ${
        isWarning ? 'text-accent-terra' : 'text-text-secondary'
      }`}>
        {timeLeft}s
      </span>
    </div>
  )
}
