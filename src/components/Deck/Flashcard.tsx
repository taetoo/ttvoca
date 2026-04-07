'use client'

import { useRef, useCallback, useEffect } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { WordItem } from '@/utils/words'
import { Volume2 } from 'lucide-react'

interface FlashcardProps {
  word: WordItem
  round: number
  onSwipeNav: (direction: 'prev' | 'next') => void
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
}

export default function Flashcard({ word, round, onSwipeNav, audioRef }: FlashcardProps) {

  /** TTS 재생 (단어 또는 예문) */
  const playTTS = useCallback((text: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    
    // 이전 오디오 즉시 중단
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    
    const url = `/api/tts?text=${encodeURIComponent(text)}&lang=en-US`
    const audio = new Audio(url)
    audioRef.current = audio
    audio.play().catch(err => console.error('TTS playback error:', err))
  }, [audioRef])

  /** 카드 마운트 시 단어 TTS 자동 재생 */
  useEffect(() => {
    const timer = setTimeout(() => playTTS(word.word), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.id])


  /** 예문 내 핵심 단어 하이라이트 처리 */
  const renderExample = () => {
    if (!word.example) return null
    const wordLower = word.word.toLowerCase()
    const exampleLower = word.example.toLowerCase()
    const idx = exampleLower.indexOf(wordLower)
    
    if (idx === -1) return <span>{word.example}</span>
    
    const before = word.example.slice(0, idx)
    const match = word.example.slice(idx, idx + word.word.length)
    const after = word.example.slice(idx + word.word.length)
    
    return (
      <>
        {before}
        <span className="text-accent-neon-text font-black underline decoration-accent-neon/40 underline-offset-2">{match}</span>
        {after}
      </>
    )
  }

  /** 가로 스와이프 내비게이션 */
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 80
    if (info.offset.x < -threshold) {
      onSwipeNav('next')
    } else if (info.offset.x > threshold) {
      onSwipeNav('prev')
    }
  }

  return (
    <motion.div
      key={word.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      className="w-full max-w-md mx-auto cursor-grab active:cursor-grabbing"
    >
      <div className="bg-bg-surface border border-border-color rounded-xl p-6 shadow-sm transition-colors">
        {/* 상단: 품사 + 학습 회차 */}
        <div className="flex items-center justify-between mb-8">
          {word.pos && (
            <span className="text-[10px] font-black text-accent-terra bg-accent-terra/10 px-3 py-1 rounded-lg border border-accent-terra/20 uppercase tracking-wider">
              {word.pos}
            </span>
          )}
          <span className="text-[10px] font-black text-text-secondary bg-btn-secondary-bg px-3 py-1 rounded-lg border border-border-color tracking-wider">
            {round}회차 학습
          </span>
        </div>

        {/* 중앙: 영단어 */}
        <div className="text-center mb-2">
          <h2 className="text-4xl font-black text-text-primary tracking-tight leading-none break-words">
            {word.word}
          </h2>
        </div>

        {/* 뜻 */}
        <p className="text-center text-lg font-bold text-text-secondary mb-4 break-keep leading-relaxed">
          {word.meaning}
        </p>

        {/* TTS 버튼 */}
        <div className="flex justify-center mb-6">
          <button
            onClick={(e) => playTTS(word.word, e)}
            className="flex items-center gap-2 px-4 py-2 bg-btn-secondary-bg hover:bg-border-color/30 border border-border-color rounded-xl text-xs font-black transition-all text-text-primary active:scale-95"
            aria-label="발음 듣기"
          >
            <Volume2 size={14} strokeWidth={2.5} />
            발음 듣기
          </button>
        </div>

        {/* 구분선 */}
        <div className="border-t border-border-color mb-4" />

        {/* 예문 영역 (블러 없이 항상 표시) */}
        {word.example && (
          <div className="p-4 bg-bg-base rounded-lg border border-border-color">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-50">
                Example
              </span>
              <button
                onClick={(e) => playTTS(word.example!, e)}
                className="flex items-center gap-1.5 px-3 py-1 bg-btn-secondary-bg hover:bg-border-color/30 border border-border-color rounded-lg text-[10px] font-black transition-all text-text-primary active:scale-95"
                aria-label="예문 듣기"
              >
                <Volume2 size={12} strokeWidth={2.5} />
                듣기
              </button>
            </div>
            
            <p className="text-sm font-semibold text-text-primary leading-relaxed">
              {renderExample()}
            </p>
            
            {word.translation && (
              <p className="text-xs font-medium text-text-secondary mt-2 leading-relaxed">
                {word.translation}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
