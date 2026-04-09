'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Info, Sparkles } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface ContextualTutorialProps {
  steps: TutorialStep[];
  onComplete: () => void;
  storageKey: string;
}

export default function ContextualTutorial({ steps, onComplete, storageKey }: ContextualTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [adaptivePosition, setAdaptivePosition] = useState<'top' | 'bottom' | 'center'>('center');
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    
    // 중앙 모달 모드
    if (step.targetId === 'center' || step.position === 'center') {
      setTargetRect(null);
      setAdaptivePosition('center');
      return;
    }

    const element = document.getElementById(step.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      
      const tooltipEstimateHeight = 180;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (step.position === 'bottom') {
        if (spaceBelow < tooltipEstimateHeight && spaceAbove > spaceBelow) {
          setAdaptivePosition('top');
        } else {
          setAdaptivePosition('bottom');
        }
      } else if (step.position === 'top') {
        if (spaceAbove < tooltipEstimateHeight && spaceBelow > spaceAbove) {
          setAdaptivePosition('bottom');
        } else {
          setAdaptivePosition('top');
        }
      } else {
        setAdaptivePosition('center');
      }
    } else {
      setTargetRect(null);
      setAdaptivePosition('center');
    }
  }, [currentStep, steps]);

  useEffect(() => {
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      setIsVisible(true);
      updateTargetRect();
    }
  }, [storageKey, updateTargetRect]);

  useEffect(() => {
    if (isVisible) {
      updateTargetRect();
      window.addEventListener('scroll', updateTargetRect);
      window.addEventListener('resize', updateTargetRect);
      return () => {
        window.removeEventListener('scroll', updateTargetRect);
        window.removeEventListener('resize', updateTargetRect);
      };
    }
  }, [isVisible, currentStep, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isCenterMode = step.targetId === 'center' || step.position === 'center';

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none font-sans overflow-hidden">
      {/* Dimmed Background with Hole */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`absolute inset-0 bg-black/80 ${isCenterMode ? 'backdrop-blur-[8px]' : 'backdrop-blur-[3px]'} pointer-events-auto transition-all duration-500`}
        style={{
          clipPath: (targetRect && !isCenterMode)
            ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
        onClick={handleClose}
      />

      {/* Highlighting Border - Only shown if NOT in center mode */}
      {targetRect && !isCenterMode && (
        <motion.div 
          layoutId="highlight-border"
          initial={false}
          animate={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
          className="absolute border-2 border-accent-neon rounded-2xl pointer-events-none shadow-[0_0_25px_rgba(206,246,112,0.6)]"
        />
      )}

      {/* Tooltip Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9, y: isCenterMode ? 0 : 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            top: isCenterMode 
              ? '50%' 
              : targetRect 
                ? (adaptivePosition === 'bottom' ? targetRect.bottom + 12 : adaptivePosition === 'top' ? targetRect.top - 12 : '50%')
                : '50%',
            left: '50%',
            x: '-50%',
            y: isCenterMode ? '-50%' : (adaptivePosition === 'top' ? '-100%' : '0%')
          }}
          exit={{ opacity: 0, scale: 0.9, y: isCenterMode ? 0 : 20 }}
          className={`absolute w-[calc(100%-48px)] ${isCenterMode ? 'max-w-[320px] p-8' : 'max-w-[340px] p-5'} bg-bg-surface border ${isCenterMode ? 'border-accent-neon' : 'border-accent-neon/30'} rounded-[24px] shadow-2xl pointer-events-auto backdrop-blur-2xl`}
        >
          {isCenterMode && (
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-accent-neon/20 rounded-2xl flex items-center justify-center border border-accent-neon/30">
                <Sparkles size={28} className="text-accent-neon-text shadow-glow" />
              </div>
            </div>
          )}

          <div className={`${isCenterMode ? 'text-center' : 'flex items-start gap-3'} mb-4`}>
            {!isCenterMode && (
              <div className="p-1.5 bg-accent-neon/20 rounded-lg shrink-0 border border-accent-neon/30">
                <Info size={16} className="text-accent-neon-text shadow-glow" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className={`${isCenterMode ? 'text-xl' : 'text-base'} font-black text-text-primary tracking-tight`}>{step.title}</h4>
              <p className={`${isCenterMode ? 'text-sm mt-3' : 'text-xs mt-1'} font-bold text-text-secondary leading-relaxed opacity-90`}>
                {step.content}
              </p>
            </div>
            {!isCenterMode && (
              <button onClick={handleClose} className="p-1.5 hover:bg-bg-base rounded-lg transition-colors text-text-secondary/50 hover:text-text-primary">
                <X size={16} />
              </button>
            )}
          </div>

          <div className={`flex justify-between items-center ${isCenterMode ? 'mt-8' : 'mt-5'} pt-4 border-t border-border-color/50`}>
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? (isCenterMode ? 'w-8 bg-accent-neon' : 'w-5 bg-accent-neon') : 'w-1.5 bg-border-color'}`} 
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className={`flex items-center gap-1.5 ${isCenterMode ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-xs'} bg-accent-neon text-black rounded-xl font-black active:scale-95 transition-all shadow-lg shadow-accent-neon/20`}
            >
              {currentStep === steps.length - 1 ? '시작하기' : '다음'}
              <ChevronRight size={isCenterMode ? 16 : 14} strokeWidth={3} />
            </button>
          </div>

          {isCenterMode && (
            <button 
              onClick={handleClose} 
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
