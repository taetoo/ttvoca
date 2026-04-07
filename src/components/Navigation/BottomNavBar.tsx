import Link from 'next/link'
import { Home, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react'

interface NavProps {
  currentTab: 'home' | 'unknown' | 'confused' | 'memorized'
}

export default function BottomNavBar({ currentTab }: NavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-surface/80 backdrop-blur-xl border-t border-border-color pb-[env(safe-area-inset-bottom,2rem)] pt-3 px-6 flex justify-between items-center z-50 transition-colors shadow-sm">
      <Link href="/dashboard" className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 ${currentTab === 'home' ? 'text-accent-neon-text' : 'text-text-secondary opacity-60 hover:opacity-100'}`}>
        <Home size={22} strokeWidth={currentTab === 'home' ? 2.5 : 2} />
        <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">홈</span>
      </Link>
      
      <Link href="/vocabs/unknown" className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 ${currentTab === 'unknown' ? 'text-accent-terra' : 'text-text-secondary opacity-60 hover:opacity-100'}`}>
        <XCircle size={22} strokeWidth={currentTab === 'unknown' ? 2.5 : 2} />
        <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Skip</span>
      </Link>
 
      <Link href="/vocabs/confused" className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 ${currentTab === 'confused' ? 'text-accent-neon-text' : 'text-text-secondary opacity-60 hover:opacity-100'}`}>
        <AlertCircle size={22} strokeWidth={currentTab === 'confused' ? 2.5 : 2} />
        <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Vague</span>
      </Link>
 
      <Link href="/vocabs/memorized" className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 ${currentTab === 'memorized' ? 'text-accent-neon-text shadow-[0_0_15px_rgba(206,246,112,0.15)]' : 'text-text-secondary opacity-60 hover:opacity-100'}`}>
        <CheckCircle2 size={22} strokeWidth={currentTab === 'memorized' ? 2.5 : 2} />
        <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Known</span>
      </Link>
    </nav>
  )
}
