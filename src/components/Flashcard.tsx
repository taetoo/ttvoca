'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { WordStatus } from '@/store/useVocaStore';
import { RefreshCw } from 'lucide-react';

interface FlashcardProps {
  word: string;
  meaning: string;
  onAction: (status: WordStatus) => void;
  zIndex: number;
}

export default function Flashcard({ word, meaning, onAction, zIndex }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset;
    const velocity = info.velocity;

    const horizontalDistance = Math.abs(offset.x);
    const verticalDistance = Math.abs(offset.y);

    const swipeThreshold = 80;
    const velocityThreshold = 400;

    if (horizontalDistance > verticalDistance) {
      if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
        onAction('memorized');
      } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
        onAction('unknown');
      }
    } else {
      if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
        onAction('confused');
      }
    }
  };

  return (
    <motion.div
      className="absolute top-0 w-full aspect-[4/5] max-h-[60vh] sm:max-h-[70vh]"
      style={{ zIndex, x, y, rotate }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      whileDrag={{ scale: 1.02 }}
    >
      <div 
        className="relative w-full h-full bg-surface rounded-3xl shadow-xl flex flex-col items-center justify-center border border-gray-100 cursor-grab"
        style={{ perspective: 1200 }}
      >
        <motion.div 
          className="w-full h-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Front Page */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-surface rounded-3xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground text-center break-words w-full">{word}</h2>
            <div className="absolute top-6 right-6">
              <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">단어</span>
            </div>
            
            <div className="absolute bottom-8 flex flex-col items-center text-gray-300">
              <RefreshCw size={24} className="mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">탭하여 뜻 확인</span>
            </div>
          </div>

          {/* Back Page (Meaning) */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gray-50 rounded-3xl shadow-inner"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
             <div className="absolute top-6 right-6">
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">뜻</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-6 pb-6 border-b border-gray-200 w-full text-center">{word}</h3>
            <p className="text-3xl md:text-4xl font-extrabold text-foreground text-center break-words w-full">{meaning}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
