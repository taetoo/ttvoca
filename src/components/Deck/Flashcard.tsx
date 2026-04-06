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

  const handleDragEnd = (_: any, info: PanInfo) => {
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
      className="absolute w-full h-[60vh] max-h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-1000 z-10"
      style={{ x, y, rotate }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
    >
      <motion.div
        onClick={() => setFlipped(!flipped)}
        className="w-full h-full relative shadow-2xl rounded-[2rem] ring-1 ring-gray-100 dark:ring-gray-800 transition-colors"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front (English) */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-[2rem] backface-hidden transition-colors"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="absolute top-6 left-6 text-xs font-bold text-gray-300 dark:text-gray-500 tracking-widest uppercase">Word</span>
          {word.day && (
            <span className="absolute top-6 right-8 text-xs font-black text-white bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full tracking-wider shadow-sm transition-colors">
              {word.day}
            </span>
          )}
          <h2 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center tracking-tight break-words px-4 leading-tight">
            {word.word}
          </h2>
          <div className="absolute bottom-8 flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400">
            <span className="text-xl">👇</span>
            <span className="text-xs font-medium">탭해서 뒷면 보기</span>
          </div>
        </div>

        {/* Back (Korean) */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 dark:bg-gray-700 text-white rounded-[2rem] backface-hidden transition-colors"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="absolute top-6 left-6 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Meaning</span>
          {word.day && (
            <span className="absolute top-6 right-8 text-xs font-black text-gray-400 bg-gray-800 dark:bg-gray-600 px-3 py-1 rounded-full tracking-wider shadow-sm transition-colors">
              {word.day}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-bold text-center px-6 leading-relaxed break-keep">
            {word.meaning}
          </h2>
        </div>

        {/* Color Indicators for swiping */}
        <motion.div className="absolute inset-0 bg-red-500 pointer-events-none rounded-[2rem]" style={{ opacity: bgWarning, transform: 'translateZ(1px)' }} />
        <motion.div className="absolute inset-0 bg-green-500 pointer-events-none rounded-[2rem]" style={{ opacity: bgSuccess, transform: 'translateZ(1px)' }} />
        <motion.div className="absolute inset-0 bg-yellow-500 pointer-events-none rounded-[2rem]" style={{ opacity: bgConfused, transform: 'translateZ(1px)' }} />
      </motion.div>
    </motion.div>
  )
}
