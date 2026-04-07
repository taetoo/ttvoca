import { X, Check, ArrowUp } from 'lucide-react'

interface CardControlsProps {
  onAction: (dir: 'left' | 'up' | 'right') => void
}

export default function CardControls({ onAction }: CardControlsProps) {
  return (
    <div className="flex justify-center items-center gap-4 mt-auto mb-6 z-20 shrink-0">
      <div className="flex flex-col items-center gap-2">
        <button 
          onClick={() => onAction('left')}
          className="w-16 h-16 bg-bg-surface border border-accent-terra/30 text-accent-terra rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-accent-terra/5"
        >
          <X size={32} strokeWidth={2.5} />
        </button>
        <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">Skip</span>
      </div>

      <div className="flex flex-col items-center gap-2 -mt-4">
        <button 
          onClick={() => onAction('up')}
          className="w-14 h-14 bg-bg-surface border border-accent-neon text-text-primary rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-accent-neon/10"
        >
          <ArrowUp size={24} strokeWidth={2.5} />
        </button>
        <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">Vague</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button 
          onClick={() => onAction('right')}
          className="w-16 h-16 bg-accent-neon border border-accent-neon text-black rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all hover:brightness-105"
        >
          <Check size={32} strokeWidth={2.5} />
        </button>
        <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">Learned</span>
      </div>
    </div>
  )
}
