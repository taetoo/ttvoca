import { X, Check, ArrowUp } from 'lucide-react'

interface CardControlsProps {
  onAction: (dir: 'left' | 'up' | 'right') => void
}

export default function CardControls({ onAction }: CardControlsProps) {
  return (
    <div className="flex justify-center items-center gap-5 mt-auto mb-16 z-20">
      <div className="flex flex-col items-center gap-2">
        <button 
          onClick={() => onAction('left')}
          className="w-16 h-16 bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/50 text-red-500 rounded-full flex items-center justify-center shadow-lg active:scale-90 active:bg-red-50 dark:active:bg-red-900/20 transition-all hover:border-red-200 dark:hover:border-red-800"
        >
          <X size={32} strokeWidth={3} />
        </button>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">못 외움</span>
      </div>

      <div className="flex flex-col items-center gap-2 -mt-4">
        <button 
          onClick={() => onAction('up')}
          className="w-14 h-14 bg-white dark:bg-gray-800 border-2 border-yellow-100 dark:border-yellow-900/50 text-yellow-500 rounded-full flex items-center justify-center shadow-lg active:scale-90 active:bg-yellow-50 dark:active:bg-yellow-900/20 transition-all hover:border-yellow-200 dark:hover:border-yellow-800"
        >
          <ArrowUp size={24} strokeWidth={3} />
        </button>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">헷갈림</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button 
          onClick={() => onAction('right')}
          className="w-16 h-16 bg-white dark:bg-gray-800 border-2 border-green-100 dark:border-green-900/50 text-green-500 rounded-full flex items-center justify-center shadow-lg active:scale-90 active:bg-green-50 dark:active:bg-green-900/20 transition-all hover:border-green-200 dark:hover:border-green-800"
        >
          <Check size={32} strokeWidth={3} />
        </button>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">외움</span>
      </div>
    </div>
  )
}
