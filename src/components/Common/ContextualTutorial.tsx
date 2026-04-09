'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Info } from 'lucide-react';

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

  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (step.targetId === 'screen') {
      setTargetRect(null);
      return;
    }
    const element = document.getElementById(step.targetId);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    } else {
      setTargetRect(null);
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

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none font-sans">
      {/* Dimmed Background with Hole */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 pointer-events-auto"
        style={{
          clipPath: targetRect 
            ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
        onClick={handleClose}
      />

      {/* Highlighting Border */}
      {targetRect && (
        <motion.div 
          layoutId="highlight-border"
          initial={false}
          animate={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
          className="absolute border-2 border-accent-neon rounded-xl pointer-events-none shadow-[0_0_20px_rgba(206,246,112,0.5)]"
        />
      )}

      {/* Tooltip Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            top: targetRect 
              ? (step.position === 'bottom' ? targetRect.bottom + 20 : step.position === 'top' ? targetRect.top - 180 : '50%')
              : '50%',
            left: targetRect 
              ? (targetRect.left + targetRect.width / 2)
              : '50%',
            x: '-50%',
            y: targetRect ? 0 : '-50%'
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute w-[calc(100%-48px)] max-w-sm bg-bg-surface border border-border-color rounded-2xl p-6 shadow-2xl pointer-events-auto"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-accent-neon/10 rounded-lg shrink-0">
              <Info size={20} className="text-accent-neon-text" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black text-text-primary tracking-tight">{step.title}</h4>
              <p className="text-sm font-bold text-text-secondary mt-1 leading-relaxed">
                {step.content}
              </p>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-bg-base rounded-md transition-colors text-text-secondary">
              <X size={18} />
            </button>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-6 bg-accent-neon' : 'w-1.5 bg-border-color'}`} 
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-neon text-black rounded-xl font-black text-sm active:scale-95 transition-all"
            >
              {currentStep === steps.length - 1 ? '시작하기' : '다음'}
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
