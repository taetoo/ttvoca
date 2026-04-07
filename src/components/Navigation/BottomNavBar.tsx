import Link from 'next/link'
import { Home, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react'

interface NavProps {
  currentTab: 'home' | 'unknown' | 'confused' | 'memorized'
}

export default function BottomNavBar({ currentTab }: NavProps) {
  return (
    <nav className="bg-surface border-t-2 border-foreground pb-8 pt-3 px-6 flex justify-between items-center z-50 transition-colors shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <Link href="/dashboard" className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 ${currentTab === 'home' ? 'text-primary' : 'text-text-secondary hover:text-foreground'}`}>
        <Home size={24} strokeWidth={currentTab === 'home' ? 3 : 2} className={currentTab === 'home' ? 'drop-shadow-[0_0_8px_rgba(206,246,112,0.5)]' : ''} />
        <span className="text-[10px] font-black mt-1">학습</span>
      </Link>
      
      <Link href="/vocabs/unknown" className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 ${currentTab === 'unknown' ? 'text-unknown' : 'text-text-secondary hover:text-unknown'}`}>
        <XCircle size={24} strokeWidth={currentTab === 'unknown' ? 3 : 2} />
        <span className="text-[10px] font-black mt-1">못 외움</span>
      </Link>
 
      <Link href="/vocabs/confused" className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 ${currentTab === 'confused' ? 'text-confused' : 'text-text-secondary hover:text-confused'}`}>
        <AlertCircle size={24} strokeWidth={currentTab === 'confused' ? 3 : 2} />
        <span className="text-[10px] font-black mt-1">헷갈림</span>
      </Link>
 
      <Link href="/vocabs/memorized" className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 ${currentTab === 'memorized' ? 'text-memorized' : 'text-text-secondary hover:text-memorized'}`}>
        <CheckCircle2 size={24} strokeWidth={currentTab === 'memorized' ? 3 : 2} />
        <span className="text-[10px] font-black mt-1">외움</span>
      </Link>
    </nav>
  )
}
