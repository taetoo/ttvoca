'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getFlatWords, WordItem } from '@/utils/words'
import { useSettingStore } from '@/store/settingStore'
import { useWordStatusStore } from '@/store/wordStatusStore'
import BottomNavBar from '@/components/Navigation/BottomNavBar'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Volume2, Filter, X, Info } from 'lucide-react'
import ContextualTutorial, { TutorialStep } from '@/components/Common/ContextualTutorial'


function VocabCard({ word, status }: { word: WordItem; status: string | null }) {
  const [isRevealed, setIsRevealed] = useState(false)

  const playWord = (e: React.MouseEvent, text: string, lang: 'en-US' | 'en-GB') => {
    e.stopPropagation()
    const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`
    const audio = new Audio(url)
    audio.play().catch(error => console.error("Audio playback error:", error))
  }

  const statusColor = status === 'memorized' ? 'bg-accent-neon' : status === 'unknown' ? 'bg-accent-terra' : 'bg-bg-base'
  const statusLabel = status === 'memorized' ? 'Known' : status === 'unknown' ? 'Skip' : 'None'

  return (
    <motion.div 
      layout
      onClick={() => setIsRevealed(!isRevealed)}
      className="bg-bg-surface p-5 rounded-xl border border-border-color flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${statusColor}`} />
      
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-black text-foreground mt-0 tracking-tight truncate">{word.word}</h3>
              {word.day && (
                <span className="shrink-0 text-[10px] font-black px-2 py-0.5 bg-bg-base text-text-secondary rounded border border-border-color uppercase tracking-wider">
                  {word.day}
                </span>
              )}
              {status && (
                <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded border border-border-color uppercase tracking-wider ${status === 'memorized' ? 'text-accent-neon-text' : 'text-accent-terra'}`}>
                  {statusLabel}
                </span>
              )}
            </div>
            <AnimatePresence mode="wait">
              {isRevealed ? (
                <motion.p 
                  key="meaning"
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-base font-bold text-text-secondary"
                >
                  {word.meaning}
                </motion.p>
              ) : (
                <motion.p 
                  key="hint"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-sm font-bold text-text-secondary opacity-30"
                >
                  터치해서 뜻 확인
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={(e) => playWord(e, word.word, 'en-US')}
              className="flex items-center justify-center gap-1.5 w-[72px] py-1.5 bg-bg-base hover:bg-border-color/20 rounded-lg border border-border-color transition-all"
            >
              <span className="text-[10px] font-black text-text-primary">🇺🇸 US</span>
              <Volume2 className="w-3 h-3 text-text-primary" />
            </button>
            <button
              onClick={(e) => playWord(e, word.word, 'en-GB')}
              className="flex items-center justify-center gap-1.5 w-[72px] py-1.5 bg-bg-base hover:bg-border-color/20 rounded-lg border border-border-color transition-all"
            >
              <span className="text-[10px] font-black text-text-primary">🇬🇧 UK</span>
              <Volume2 className="w-3 h-3 text-text-primary" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function SearchPage() {
  const router = useRouter()
  const { targetScore } = useSettingStore()
  const statuses = useWordStatusStore((state) => state.statuses)
  
  const [allWords, setAllWords] = useState<WordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  const searchSteps: TutorialStep[] = [
    {
      targetId: 'search-bar',
      title: '단어 검색',
      content: '단어나 뜻을 입력하여 원하는 단어를 즉시 찾을 수 있습니다.',
      position: 'bottom'
    },
    {
      targetId: 'filter-chips',
      title: '학습 상태 필터',
      content: '외운 단어, 모르는 단어, 혹은 아직 보지 않은 단어만 따로 골라볼 수 있습니다.',
      position: 'bottom'
    }
  ];
  
  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'memorized' | 'unknown' | 'unseen'>('all')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const loadData = () => {
      // 전체 단어 가져오기 (타겟 등급 필터)
      let words = getFlatWords()
      if (targetScore) {
        words = words.filter(w => w.grade?.includes(targetScore.toString()))
      }
      setAllWords(words)
      setLoading(false)
    }

    loadData()
  }, [targetScore, isMounted])

  // 필터링된 리스트
  const filteredList = useMemo(() => {
    return allWords.filter(word => {
      const status = statuses[word.id] || 'unseen'
      
      // 검색어 체크
      const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      
      // 필터 체크
      const matchesFilter = activeFilter === 'all' || status === activeFilter
      
      return matchesSearch && matchesFilter
    })
  }, [allWords, statuses, searchQuery, activeFilter])

  if (!isMounted) {
    return (
      <div className="flex flex-col h-[100dvh] bg-bg-base overflow-hidden font-sans justify-center items-center">
        <div className="w-16 h-16 border-4 border-border-color border-t-accent-neon rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-bg-base text-text-primary font-sans transition-colors">
      <header className="px-6 py-8 pb-6 bg-bg-surface border-b border-border-color z-10 sticky top-0 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black tracking-tight">전체 단어장</h1>
          <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">
            {filteredList.length} Words
          </div>
        </div>

        {/* 검색 바 */}
        <div id="search-bar" className="relative mb-4">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-secondary opacity-50">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="단어 또는 뜻 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3.5 pl-11 pr-4 bg-bg-base border border-border-color rounded-xl font-bold text-sm focus:outline-none focus:border-accent-neon transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-text-secondary opacity-50"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* 필터 칩 */}
        <div id="filter-chips" className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-black text-white border-black' : 'bg-bg-base text-text-secondary border-border-color'}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveFilter('memorized')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${activeFilter === 'memorized' ? 'bg-accent-neon text-black border-accent-neon' : 'bg-bg-base text-text-secondary border-border-color'}`}
          >
            Known
          </button>
          <button 
            onClick={() => setActiveFilter('unknown')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${activeFilter === 'unknown' ? 'bg-accent-terra text-white border-accent-terra' : 'bg-bg-base text-text-secondary border-border-color'}`}
          >
            Skip
          </button>
          <button 
            onClick={() => setActiveFilter('unseen')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${activeFilter === 'unseen' ? 'bg-bg-surface text-text-primary border-border-color border-dashed' : 'bg-bg-base text-text-secondary border-border-color'}`}
          >
            Unseen
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4 pb-32">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-[100px] bg-bg-surface rounded-xl w-full border border-border-color"></div>
            ))}
          </div>
        ) : filteredList.length > 0 ? (
          filteredList.map(word => (
            <VocabCard key={word.id} word={word} status={statuses[word.id] || null} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary font-bold mt-20 opacity-40">
            <span className="text-5xl mb-4">🔍</span>
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </main>

      <BottomNavBar currentTab="all" />

      <ContextualTutorial 
        steps={searchSteps} 
        storageKey="hasSeenSearchGuide"
        onComplete={() => {}} 
      />
    </div>
  )
}

