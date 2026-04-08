import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, ArrowLeftRight, Sparkles, Zap } from 'lucide-react';

interface StudyTutorialProps {
  onComplete: () => void;
}

export default function StudyTutorial({ onComplete }: StudyTutorialProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-bg-base/60 backdrop-blur-md flex items-center justify-center p-6 font-sans"
    >
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-sm bg-bg-surface border border-border-color rounded-xl p-8 shadow-sm"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-text-primary mb-2 tracking-tight">학습 가이드</h2>
          <p className="text-text-secondary text-sm font-semibold">새로운 학습 방식을 알아보세요!</p>
        </div>

        <div className="space-y-5">
          {/* 스와이프 내비게이션 */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-btn-secondary-bg border border-border-color rounded-xl flex items-center justify-center shrink-0">
              <ArrowLeftRight size={18} strokeWidth={2.5} className="text-text-secondary" />
            </div>
            <div>
              <p className="font-black text-text-primary text-sm">좌우 스와이프</p>
              <p className="text-xs text-text-secondary mt-0.5">이전/다음 카드로 이동합니다.</p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-accent-neon/10 border border-accent-neon/20 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-accent-neon-text">외움</span>
            </div>
            <div>
              <p className="font-black text-text-primary text-sm">하단 상태 버튼</p>
              <p className="text-xs text-text-secondary mt-0.5">
                <span className="text-accent-terra font-black">모름</span> · 
                <span className="text-accent-neon-text font-black"> 외움</span>을 눌러 상태를 저장하고 다음 카드로 넘어갑니다.
              </p>
            </div>
          </div>

          {/* TTS */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-btn-secondary-bg border border-border-color rounded-xl flex items-center justify-center shrink-0">
              <Volume2 size={18} strokeWidth={2.5} className="text-text-secondary" />
            </div>
            <div>
              <p className="font-black text-text-primary text-sm">자동 발음 재생</p>
              <p className="text-xs text-text-secondary mt-0.5">카드가 바뀌면 영단어 발음이 자동 재생됩니다. 예문은 듣기 버튼을 눌러 확인하세요.</p>
            </div>
          </div>

          {/* 학습 → 퀴즈 흐름 */}
          <div className="flex items-start gap-4 pt-4 border-t border-border-color">
            <div className="w-11 h-11 bg-accent-neon/10 border border-accent-neon/20 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={18} strokeWidth={2.5} className="text-accent-neon-text" />
            </div>
            <div>
              <p className="font-black text-text-primary text-sm">학습 → 퀴즈 → 복습</p>
              <p className="text-xs text-text-secondary mt-0.5">모든 단어를 학습하면 퀴즈를 풀고, 틀린 단어만 다시 복습할 수 있습니다.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full mt-8 py-4 bg-btn-primary-bg text-btn-primary-text rounded-xl font-black text-base active:scale-95 transition-all"
        >
          확인했습니다
        </button>
      </motion.div>
    </motion.div>
  );
}
