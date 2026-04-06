import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Check, X, HelpCircle } from 'lucide-react';

interface StudyTutorialProps {
  onComplete: () => void;
}

export default function StudyTutorial({ onComplete }: StudyTutorialProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const handVariants = {
    idle: { x: 0, y: 0 },
    swipeRight: {
      x: [0, 80, 0],
      transition: { duration: 2, repeat: Infinity, repeatDelay: 1 }
    },
    swipeLeft: {
      x: [0, -80, 0],
      transition: { duration: 2, repeat: Infinity, repeatDelay: 1, delay: 0.5 }
    },
    swipeUp: {
      y: [0, -80, 0],
      transition: { duration: 2, repeat: Infinity, repeatDelay: 1, delay: 1 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed inset-0 z-[100] bg-white/20 dark:bg-black/20 backdrop-blur-md flex items-center justify-center p-6 font-sans"
    >
      <div className="w-full max-w-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/50 dark:border-white/10 relative overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">학습 가이드</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">스와이프로 단어를 학습해보세요!</p>
        </div>

        <div className="space-y-8 relative">
          {/* Swipe Right Guide */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600">
              <Check size={24} strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">우측으로 스와이프</p>
              <p className="text-xs text-gray-500">완벽히 아는 단어 (인증 완료)</p>
            </div>
            <motion.div animate="swipeRight" variants={handVariants}>
              <MousePointer2 className="text-gray-400 rotate-[20deg]" size={20} />
            </motion.div>
          </div>

          {/* Swipe Left Guide */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600">
              <X size={24} strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">좌측으로 스와이프</p>
              <p className="text-xs text-gray-500">아직 모르는 단어 (심화 학습)</p>
            </div>
            <motion.div animate="swipeLeft" variants={handVariants}>
              <MousePointer2 className="text-gray-400 rotate-[-20deg]" size={20} />
            </motion.div>
          </div>

          {/* Swipe Up Guide */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center text-yellow-600">
              <HelpCircle size={24} strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">위쪽으로 스와이프</p>
              <p className="text-xs text-gray-500">헷갈리는 단어 (표시 처리)</p>
            </div>
            <motion.div animate="swipeUp" variants={handVariants}>
              <MousePointer2 className="text-gray-400" size={20} />
            </motion.div>
          </div>

          {/* Tap Guide */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
              <span className="font-black text-xs">TAP</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">카드 탭하기</p>
              <p className="text-xs text-gray-500">단어의 뜻 확인하기</p>
            </div>
          </div>

          {/* Counter Guide */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-500">
              <span className="font-black text-xs">COUNT</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">상단 숫자 안내</p>
              <p className="text-xs text-gray-500">완벽히 외운 단어(오른쪽 스와이프)만 카운트에서 제외되며, 나머지는 반복 노출됩니다.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full mt-10 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
        >
          확인했습니다
        </button>
      </div>
    </motion.div>
  );
}
