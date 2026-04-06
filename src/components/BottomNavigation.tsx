'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, XCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useVocaStore } from '@/store/useVocaStore';

export default function BottomNavigation() {
  const pathname = usePathname();
  const words = useVocaStore((state) => state.words);

  const getCount = (status: string | null) => words.filter(w => w.status === status).length;

  const navItems = [
    { href: '/study', label: '학습', icon: BookOpen, count: words.filter(w => w.status === null).length },
    { href: '/vocabs/unknown', label: '못 외운', icon: XCircle, activeColor: 'text-color-unknown', count: getCount('unknown') },
    { href: '/vocabs/confused', label: '헷갈리는', icon: HelpCircle, activeColor: 'text-color-confused', count: getCount('confused') },
    { href: '/vocabs/memorized', label: '외운', icon: CheckCircle2, activeColor: 'text-color-memorized', count: getCount('memorized') },
  ];

  if (pathname === '/') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-end h-[70px] pb-2 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full pt-1 transition-colors ${
                isActive ? 'text-foreground' : 'text-gray-400'
              }`}
            >
              <div className={`relative flex items-center justify-center mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive && item.activeColor ? item.activeColor : ''} />
                {item.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gray-100 text-[10px] font-bold text-gray-600 px-1.5 py-0.5 rounded-full border border-white">
                    {item.count}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
