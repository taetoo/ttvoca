'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getFlatWords } from '@/utils/words'
import { useSettingStore } from '@/store/settingStore'
import BottomNavBar from '@/components/Navigation/BottomNavBar'
import { AnimatePresence, motion } from 'framer-motion'

import { User } from '@supabase/supabase-js'
import { WordItem } from '@/utils/words'
import { Volume2 } from 'lucide-react'

function VocabCard({ word }: { word: WordItem }) {
  const [isRevealed, setIsRevealed] = useState(false)

  const playWord = (e: React.MouseEvent, text: string, lang: 'en-US' | 'en-GB') => {
    e.stopPropagation(); // 카드 터치 이벤트(뜻 보기) 중단
    
    // 내부 프록시 API를 호출하여 브라우저 CORS 및 403 에러 우회
    const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`;
    const audio = new Audio(url);
    
    audio.play().catch(error => {
      console.error("Audio playback error:", error);
    });
  };

  return (
    <motion.div 
      layout
      onClick={() => setIsRevealed(!isRevealed)}
      className="bg-bg-surface p-5 rounded-xl border border-border-color flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm"
    >
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-foreground mt-0 tracking-tight">{word.word}</h3>
            {word.day && (
              <span className="text-[10px] font-black px-2 py-0.5 bg-bg-base text-text-secondary rounded border border-border-color uppercase tracking-wider">
                {word.day}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={(e) => playWord(e, word.word, 'en-US')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-base hover:bg-border-color/20 rounded-lg border border-border-color transition-all"
              aria-label="미국식 발음 듣기"
            >
              <span className="text-[10px] font-black text-text-primary">🇺🇸 US</span>
              <Volume2 className="w-3 h-3 text-text-primary" />
            </button>
            <button
              onClick={(e) => playWord(e, word.word, 'en-GB')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-base hover:bg-border-color/20 rounded-lg border border-border-color transition-all"
              aria-label="영국식 발음 듣기"
            >
              <span className="text-[10px] font-black text-text-primary">🇬🇧 UK</span>
              <Volume2 className="w-3 h-3 text-text-primary" />
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {isRevealed ? (
            <motion.p 
              key="meaning"
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="text-base font-bold text-text-secondary mt-2"
            >
              {word.meaning}
            </motion.p>
          ) : (
            <motion.p 
              key="hint"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="text-sm font-bold text-text-secondary opacity-30 mt-2"
            >
              터치해서 뜻 확인
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function VocabListPage() {
  const params = useParams()
  const status = params.status as string // 'unknown' | 'confused' | 'memorized'
  const router = useRouter()
  const supabase = createClient()
  const { targetScore } = useSettingStore()
  const [list, setList] = useState<WordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const titleMap: Record<string, string> = {
    unknown: '못 외운 단어',
    confused: '헷갈리는 단어',
    memorized: '외운 단어'
  }
  
  const colorMap: Record<string, string> = {
    unknown: 'text-unknown',
    confused: 'text-confused',
    memorized: 'text-memorized'
  }

  useEffect(() => {
    if (!status) return

    const fetchList = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      const { data: statusData } = await supabase
        .from('user_word_status')
        .select('word_id, status')
        .eq('user_id', session.user.id)
        .eq('status', status)

      const wordIds = new Set(statusData?.map(s => s.word_id))
      
      let allWords = getFlatWords()
      
      // 설정값 필터 적용
      if (targetScore) {
        allWords = allWords.filter(w => w.grade?.includes(targetScore.toString()))
      }

      const filtered = allWords.filter(w => wordIds.has(w.id))

      setList(filtered)
      setLoading(false)
    }

    fetchList()
  }, [status, router, targetScore, supabase])

  return (
    <div className="flex flex-col h-[100dvh] bg-bg-base text-text-primary font-sans transition-colors">
      <header className="px-6 py-8 pb-6 bg-bg-surface border-b border-border-color z-10 sticky top-0 flex justify-between items-end shadow-sm transition-colors">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${colorMap[status] || 'text-text-primary'}`}>
            {titleMap[status] || '단어장'}
          </h1>
          {!loading && <p className="text-[10px] font-black text-text-secondary mt-1 uppercase tracking-widest opacity-60">총 {list.length}개의 단어</p>}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4 pb-32">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-[100px] bg-surface rounded-xl w-full border border-border-base"></div>
            ))}
          </div>
        ) : list.length > 0 ? (
          list.map(word => (
            <VocabCard key={word.id} word={word} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary font-bold mt-20 opacity-40">
            <span className="text-5xl mb-4">🍃</span>
            <p>해당하는 단어가 없습니다.</p>
          </div>
        )}
      </main>

      {user && <BottomNavBar currentTab={status as 'unknown' | 'confused' | 'memorized'} />}
    </div>
  )
}

