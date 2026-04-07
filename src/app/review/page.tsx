'use client'

import { useRouter } from 'next/navigation'
import { useSettingStore } from '@/store/settingStore'
import { motion } from 'framer-motion'
import { Home, RotateCcw, Trophy, XCircle, CheckCircle } from 'lucide-react'

export default function ReviewPage() {
  const router = useRouter()
  const { quizResults, missedWords, setStudyPhase, setLearningMode, resetStudySession, incrementRound } = useSettingStore()
  
  const total = quizResults.correct + quizResults.incorrect
  const scorePercent = total > 0 ? Math.round((quizResults.correct / total) * 100) : 0
  const isPerfect = quizResults.incorrect === 0 && total > 0

  /** 틀린 단어만 복습 (Phase 1로 재진입) */
  const handleReviewMissed = () => {
    setStudyPhase('study')
    setLearningMode('review')
    incrementRound()
    router.push('/study')
  }

  /** 홈으로 돌아가기 */
  const handleGoHome = () => {
    resetStudySession()
    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-bg-base overflow-hidden font-sans transition-colors pt-[env(safe-area-inset-top)]">
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-sm"
        >
          {/* 결과 요약 카드 */}
          <div className="bg-bg-surface border border-border-color rounded-xl p-8 shadow-sm text-center mb-6">
            {/* 아이콘 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isPerfect 
                  ? 'bg-accent-neon/10 border border-accent-neon/20' 
                  : 'bg-accent-terra/10 border border-accent-terra/20'
              }`}
            >
              <Trophy size={36} className={isPerfect ? 'text-accent-neon-text' : 'text-accent-terra'} />
            </motion.div>

            {/* 제목 */}
            <h2 className="text-2xl font-black text-text-primary mb-1 tracking-tight">
              {isPerfect ? '완벽합니다!' : '퀴즈 완료!'}
            </h2>
            <p className="text-sm font-semibold text-text-secondary mb-8">
              {isPerfect 
                ? '모든 문제를 맞혔어요 🎉' 
                : '틀린 단어를 복습해 보세요'}
            </p>

            {/* 점수 */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-6xl font-black tabular-nums ${
                  scorePercent >= 80 ? 'text-accent-neon-text' : scorePercent >= 50 ? 'text-text-primary' : 'text-accent-terra'
                }`}
              >
                {scorePercent}
              </motion.span>
              <span className="text-2xl font-black text-text-secondary">%</span>
            </div>

            {/* 상세 결과 */}
            <div className="flex gap-3 mb-2">
              <div className="flex-1 p-4 bg-accent-neon/5 border border-accent-neon/20 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle size={14} className="text-accent-neon-text" />
                  <span className="text-xs font-black text-text-secondary uppercase tracking-wider">정답</span>
                </div>
                <span className="text-2xl font-black text-text-primary tabular-nums">{quizResults.correct}</span>
              </div>
              <div className="flex-1 p-4 bg-accent-terra/5 border border-accent-terra/20 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <XCircle size={14} className="text-accent-terra" />
                  <span className="text-xs font-black text-text-secondary uppercase tracking-wider">오답</span>
                </div>
                <span className="text-2xl font-black text-text-primary tabular-nums">{quizResults.incorrect}</span>
              </div>
            </div>
          </div>

          {/* 틀린 단어 목록 (있는 경우) */}
          {missedWords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-bg-surface border border-border-color rounded-xl p-5 mb-6 shadow-sm"
            >
              <h3 className="text-xs font-black text-accent-terra uppercase tracking-widest mb-3">
                틀린 단어 ({missedWords.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {missedWords.map(w => (
                  <div key={w.id} className="flex justify-between items-center py-2 px-3 bg-bg-base rounded-lg text-sm">
                    <span className="font-bold text-text-primary">{w.word}</span>
                    <span className="font-medium text-text-secondary text-xs truncate ml-3">{w.meaning}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 액션 버튼 */}
          <div className="space-y-3">
            {missedWords.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleReviewMissed}
                className="w-full flex items-center justify-center gap-2 py-4 bg-accent-neon text-black rounded-xl font-black text-base transition-all"
              >
                <RotateCcw size={18} />
                틀린 단어만 복습하기
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleGoHome}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-base transition-all ${
                missedWords.length > 0 
                  ? 'bg-btn-secondary-bg text-text-primary border border-border-color' 
                  : 'bg-accent-neon text-black'
              }`}
            >
              <Home size={18} />
              홈으로 돌아가기
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
