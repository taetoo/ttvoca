'use client'

import { motion } from 'framer-motion'
import { WordItem } from '@/utils/words'

interface QuizCardProps {
  question: WordItem
  choices: WordItem[]
  onAnswer: (selectedWord: WordItem) => void
  feedbackState: 'idle' | 'correct' | 'incorrect'
  correctAnswer?: WordItem
}

export default function QuizCard({ question, choices, onAnswer, feedbackState, correctAnswer }: QuizCardProps) {
  const labels = ['A', 'B', 'C']

  /** 예문 내 정답 단어를 _____ 로 치환 */
  const renderBlankExample = () => {
    if (!question.example) return '예문이 없습니다.'
    
    const wordLower = question.word.toLowerCase()
    const exampleLower = question.example.toLowerCase()
    const idx = exampleLower.indexOf(wordLower)
    
    if (idx === -1) {
      // 예문에 단어가 그대로 없는 경우 첫 번째 단어를 빈칸 처리
      return question.example.replace(/\S+/, '_____')
    }
    
    const before = question.example.slice(0, idx)
    const after = question.example.slice(idx + question.word.length)
    
    return (
      <>
        {before}
        <span className="text-accent-neon-text font-black">_____</span>
        {after}
      </>
    )
  }

  const getButtonStyle = (choice: WordItem) => {
    if (feedbackState === 'idle') {
      return 'bg-bg-surface border-border-color text-text-primary hover:border-accent-neon/40 hover:bg-accent-neon/5'
    }
    
    // 정답인 선지
    if (choice.id === question.id) {
      return 'bg-accent-neon/10 border-accent-neon text-text-primary'
    }
    
    // 오답인 선지 (사용자가 선택한 틀린 답)
    if (feedbackState === 'incorrect' && correctAnswer && choice.id !== question.id) {
      return 'bg-bg-surface border-border-color text-text-secondary opacity-50'
    }

    return 'bg-bg-surface border-border-color text-text-secondary opacity-50'
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-bg-surface border border-border-color rounded-xl p-6 shadow-sm transition-colors">
        {/* 한글 뜻 */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-50 block mb-2">
            Meaning
          </span>
          <h2 className="text-2xl font-black text-text-primary leading-tight break-keep">
            {question.meaning}
          </h2>
        </div>

        {/* 예문 (빈칸) */}
        <div className="p-4 bg-bg-base rounded-lg border border-border-color mb-6">
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-50 block mb-2">
            Fill in the blank
          </span>
          <p className="text-sm font-semibold text-text-primary leading-relaxed">
            {renderBlankExample()}
          </p>
          {question.translation && (
            <p className="text-xs font-medium text-text-secondary mt-2 leading-relaxed">
              {question.translation}
            </p>
          )}
        </div>

        {/* 3지 선다 */}
        <div className="space-y-3">
          {choices.map((choice, i) => (
            <motion.button
              key={choice.id}
              whileTap={feedbackState === 'idle' ? { scale: 0.97 } : {}}
              onClick={() => feedbackState === 'idle' && onAnswer(choice)}
              disabled={feedbackState !== 'idle'}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border font-bold text-left transition-all ${getButtonStyle(choice)}`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                feedbackState !== 'idle' && choice.id === question.id 
                  ? 'bg-accent-neon text-black' 
                  : 'bg-btn-secondary-bg text-text-secondary border border-border-color'
              }`}>
                {labels[i]}
              </span>
              <span className="text-sm">{choice.word}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
