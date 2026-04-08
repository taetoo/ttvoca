'use client';

import React, { use, useState } from 'react';
import { useVocaStore, WordStatus } from '@/store/useVocaStore';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{ type: string }>;
}

const CATEGORY_MAP: Record<string, { label: string; dotClass: string; color: string; }> = {
  unknown: { label: '못 외운 단어', dotClass: 'bg-color-unknown', color: 'text-color-unknown' },
  memorized: { label: '외운 단어 (완벽)', dotClass: 'bg-color-memorized', color: 'text-color-memorized' },
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const type = resolvedParams.type as WordStatus;
  const { words } = useVocaStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredWords = words.filter(w => w.status === type);
  const categoryInfo = CATEGORY_MAP[type as string] || { label: '단어 목록', dotClass: 'bg-gray-400', color: 'text-gray-500' };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-[calc(80px+env(safe-area-inset-bottom))]">
      {/* Header Area */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-surface/90 backdrop-blur-md border-b border-gray-100">
        <Link href="/study" className="p-2 -ml-2 text-gray-400 hover:text-foreground active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </Link>
        <div className="font-extrabold text-foreground flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${categoryInfo.dotClass} shadow-sm`} />
          {categoryInfo.label}
        </div>
        <div className={`w-8 font-extrabold text-right text-lg ${categoryInfo.color}`}>
          {filteredWords.length}
        </div>
      </header>

      {/* List Area */}
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 animate-in fade-in duration-500">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 opacity-20 ${categoryInfo.dotClass}`} />
            <p className="font-bold text-gray-500">분류된 단어가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWords.map((word) => {
              const isExpanded = expandedId === word.id;
              
              return (
                <div 
                  key={word.id} 
                  className={`bg-surface border-2 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                    isExpanded ? 'border-gray-800' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <button 
                    onClick={() => toggleExpand(word.id)}
                    className="w-full flex items-center justify-between p-5 focus:outline-none focus:bg-gray-50 active:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl font-bold text-foreground text-left tracking-tight">{word.word}</span>
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-foreground' : 'text-gray-400'}`}>
                      <ChevronDown size={24} strokeWidth={2.5} />
                    </div>
                  </button>
                  
                  {/* CSS Grid Accordion Trick for smooth height transition */}
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    } grid`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-1 bg-surface">
                        <div className="w-full h-px bg-gray-100 mb-4" />
                        <p className="text-xl font-bold text-gray-600 leading-relaxed">{word.meaning}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
