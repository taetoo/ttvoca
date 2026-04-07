import { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { WordItem } from '@/utils/words'

interface FlashcardProps {
  word: WordItem
  onSwipe: (direction: 'left' | 'right' | 'up', wordId: number) => void
}

export default function Flashcard({ word, onSwipe }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Calculate rotation based on x
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  
  // Calculate opacity for color overlays
  const bgWarning = useTransform(x, [-100, 0], [0.3, 0]) // Left (Red)
  const bgSuccess = useTransform(x, [0, 100], [0, 0.3])  // Right (Green)
  const bgConfused = useTransform(y, [-100, 0], [0.3, 0]) // Up (Yellow)

  const playWord = (e: React.MouseEvent, text: string, lang: 'en-US' | 'en-GB') => {
    e.stopPropagation(); // 브라우저가 클릭 이벤트를 부모(Flip)로 전달하는 것을 막음
    
    // 내부 프록시 API를 호출하여 브라우저 CORS 및 403 에러 우회
    const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`;
    const audio = new Audio(url);
    
    audio.play().catch(error => {
      console.error("Audio playback error:", error);
      alert('발음 재생에 실패했습니다.');
    });
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100
    if (info.offset.x < -swipeThreshold) {
      onSwipe('left', word.id)
    } else if (info.offset.x > swipeThreshold) {
      onSwipe('right', word.id)
    } else if (info.offset.y < -swipeThreshold) {
      onSwipe('up', word.id)
    }
  }

  return (
    <motion.div
      className="absolute w-full h-[55vh] max-h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-1000 z-10"
      style={{ x, y, rotate }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
    >
      <motion.div
        onClick={() => setFlipped(!flipped)}
        className="w-full h-full relative rounded-xl transition-colors"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front (English) */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-bg-surface border border-border-color rounded-xl backface-hidden transition-colors shadow-sm"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="absolute top-8 left-8 text-[10px] font-black text-text-secondary tracking-widest uppercase opacity-50">Word</span>
          {word.day && (
            <span className="absolute top-8 right-8 text-[10px] font-black text-btn-secondary-text bg-btn-secondary-bg px-3 py-1 rounded-lg border border-border-color tracking-wider transition-colors">
              {word.day}
            </span>
          )}
          <h2 className="text-5xl font-black text-text-primary text-center tracking-tighter break-words px-4 leading-none mb-2">
            {word.word}
          </h2>
          
          <div className="flex gap-3 mt-10">
            <button
              onClick={(e) => playWord(e, word.word, 'en-US')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-btn-secondary-bg hover:bg-border-color/20 border border-border-color rounded-xl text-[10px] font-black transition-all text-text-primary"
              aria-label="미국식 발음 듣기"
            >
              🇺🇸 US
            </button>
            <button
              onClick={(e) => playWord(e, word.word, 'en-GB')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-btn-secondary-bg hover:bg-border-color/20 border border-border-color rounded-xl text-[10px] font-black transition-all text-text-primary"
              aria-label="영국식 발음 듣기"
            >
              🇬🇧 UK
            </button>
          </div>
          <div className="absolute bottom-10 flex flex-col items-center gap-1 text-text-secondary opacity-40">
            <span className="text-[10px] font-black uppercase tracking-widest">Tap to flip</span>
          </div>
        </div>

        {/* Back (Korean) */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-bg-surface text-text-primary rounded-xl border border-border-color backface-hidden transition-colors shadow-sm"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent-neon/30" />
          <span className="absolute top-8 left-8 text-[10px] font-black text-text-secondary tracking-widest uppercase opacity-50">Meaning</span>
          <h2 className="text-3xl font-black text-center px-10 leading-tight break-keep tracking-tight">
            {word.meaning}
          </h2>
          <div className="absolute bottom-10 flex flex-col items-center gap-1 text-text-secondary opacity-40">
            <span className="text-[10px] font-black uppercase tracking-widest">Swipe to mark</span>
          </div>
        </div>

        {/* Color Indicators for swiping */}
        <motion.div className="absolute inset-0 bg-accent-terra/10 pointer-events-none rounded-xl border border-accent-terra/30" style={{ opacity: bgWarning, transform: 'translateZ(1px)' }} />
        <motion.div className="absolute inset-0 bg-accent-neon/10 pointer-events-none rounded-xl border border-accent-neon/30" style={{ opacity: bgSuccess, transform: 'translateZ(1px)' }} />
        <motion.div className="absolute inset-0 bg-accent-neon/5 pointer-events-none rounded-xl border border-accent-neon/20" style={{ opacity: bgConfused, transform: 'translateZ(1px)' }} />
      </motion.div>
    </motion.div>
  )
}
