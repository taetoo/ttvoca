'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { useCsvParser } from '@/hooks/useCsvParser';
import { useVocaStore } from '@/store/useVocaStore';
import { useRouter } from 'next/navigation';

export default function HomeSetup() {
  const router = useRouter();
  const { parseFile, error, setError } = useCsvParser();
  const { words, setTargetScore } = useVocaStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [localScore, setLocalScore] = useState<'600' | '900' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      parseFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      parseFile(e.target.files[0]);
    }
  };

  const handleStart = () => {
    if (!localScore) {
      setError('목표 점수를 선택해주세요.');
      return;
    }
    setTargetScore(localScore);
    router.push('/study');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">토익 보카 훈련</h1>
        <p className="text-sm text-gray-500 font-medium">단어장 데이터(CSV)를 업로드해 주세요.</p>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer 
        ${isDragging ? 'border-gray-800 bg-gray-50' : 'border-gray-200 bg-surface hover:border-gray-300 shadow-sm'}`}
      >
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {words.length > 0 ? (
          <div className="flex flex-col items-center text-color-memorized">
            <CheckCircle2 size={48} strokeWidth={1.5} className="mb-4" />
            <span className="font-bold text-lg">{words.length}개의 단어 로드 성공</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <UploadCloud size={48} strokeWidth={1.5} className="mb-4 text-gray-300" />
            <span className="font-semibold text-gray-600 mb-1">여기로 파일을 끌어다 놓거나</span>
            <span className="text-sm text-gray-400">클릭하여 파일 찾기</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-color-unknown text-sm rounded-lg w-full text-center font-medium">
          {error}
        </div>
      )}

      {words.length > 0 && (
        <div className="w-full mt-8 flex flex-col gap-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">목표 점수 선택</label>
            <div className="flex gap-3">
              {['600', '900'].map((score) => (
                <button
                  key={score}
                  onClick={() => setLocalScore(score as '600' | '900')}
                  className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all shadow-sm ${
                    localScore === score 
                    ? 'bg-foreground text-surface ring-2 ring-foreground ring-offset-1' 
                    : 'bg-surface text-foreground border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {score}점
                </button>
              ))}
            </div>
          </div>


          <button 
            onClick={handleStart}
            className="w-full py-4 bg-foreground text-surface font-bold text-lg rounded-xl mt-4 active:scale-[0.98] transition-all shadow-md"
          >
            학습 시작하기
          </button>
        </div>
      )}
    </div>
  );
}
