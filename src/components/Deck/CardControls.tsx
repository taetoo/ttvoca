import { motion } from 'framer-motion'

interface CardControlsProps {
  onAction: (status: 'unknown' | 'confused' | 'memorized') => void
}

export default function CardControls({ onAction }: CardControlsProps) {
  return (
    <div className="flex justify-center items-center gap-3 mt-auto mb-6 px-6 z-20 shrink-0">
      {/* 모름 버튼 */}
      <motion.button 
        whileTap={{ scale: 0.92 }}
        onClick={() => onAction('unknown')}
        className="flex-1 py-4 bg-accent-terra/10 hover:bg-accent-terra/20 border border-accent-terra/30 text-accent-terra rounded-xl font-black text-base transition-all"
      >
        모름
      </motion.button>

      {/* 헷갈림 버튼 */}
      <motion.button 
        whileTap={{ scale: 0.92 }}
        onClick={() => onAction('confused')}
        className="flex-1 py-4 bg-btn-secondary-bg hover:bg-border-color/30 border border-border-color text-text-primary rounded-xl font-black text-base transition-all"
      >
        헷갈림
      </motion.button>

      {/* 외움 버튼 */}
      <motion.button 
        whileTap={{ scale: 0.92 }}
        onClick={() => onAction('memorized')}
        className="flex-1 py-4 bg-accent-neon hover:brightness-105 border border-accent-neon text-black rounded-xl font-black text-base transition-all"
      >
        외움
      </motion.button>
    </div>
  )
}
