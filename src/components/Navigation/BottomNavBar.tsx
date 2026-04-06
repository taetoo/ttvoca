import Link from 'next/link'
import { Home, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react'

interface NavProps {
  currentTab: 'home' | 'unknown' | 'confused' | 'memorized'
}

export default function BottomNavBar({ currentTab }: NavProps) {
  return (
    <nav className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-50 transition-colors">
      <Link href="/" className={`flex flex-col items-center p-2 rounded-xl transition-colors w-16 ${currentTab === 'home' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
        <Home size={24} strokeWidth={currentTab === 'home' ? 3 : 2} className={currentTab === 'home' ? '-mt-1' : ''} />
        <span className="text-[10px] font-bold mt-1">학습</span>
      </Link>
      
      <Link href="/vocabs/unknown" className={`flex flex-col items-center p-2 rounded-xl transition-colors w-16 ${currentTab === 'unknown' ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`}>
        <XCircle size={24} strokeWidth={currentTab === 'unknown' ? 3 : 2} className={currentTab === 'unknown' ? '-mt-1' : ''} />
        <span className="text-[10px] font-bold mt-1">못 외움</span>
      </Link>

      <Link href="/vocabs/confused" className={`flex flex-col items-center p-2 rounded-xl transition-colors w-16 ${currentTab === 'confused' ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'}`}>
        <AlertCircle size={24} strokeWidth={currentTab === 'confused' ? 3 : 2} className={currentTab === 'confused' ? '-mt-1' : ''} />
        <span className="text-[10px] font-bold mt-1">헷갈림</span>
      </Link>

      <Link href="/vocabs/memorized" className={`flex flex-col items-center p-2 rounded-xl transition-colors w-16 ${currentTab === 'memorized' ? 'text-green-500' : 'text-gray-400 dark:text-gray-500 hover:bg-green-50 dark:hover:bg-green-900/30'}`}>
        <CheckCircle2 size={24} strokeWidth={currentTab === 'memorized' ? 3 : 2} className={currentTab === 'memorized' ? '-mt-1' : ''} />
        <span className="text-[10px] font-bold mt-1">외움</span>
      </Link>
    </nav>
  )
}
