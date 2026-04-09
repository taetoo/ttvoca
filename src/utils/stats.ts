import { createClient } from './supabase/client';
import { getFlatWords, WordItem } from './words';

export interface UserStats {
  totalCount: number;
  memorizedCount: number;
  unknownCount: number;
  unseenCount: number;
  progress: number;
}

/**
 * 목표 점수(grade)에 따른 현재 사용자의 학습 통계를 가져오는 함수
 */
export async function fetchUserStats(userId: string, targetScore: number): Promise<UserStats> {
  const supabase = createClient();
  
  // 1. 해당 grade의 전체 단어 리스트 가져오기
  const allWords = getFlatWords();
  const targetGradeWords = allWords.filter(w => w.grade?.includes(targetScore.toString()));
  const totalCount = targetGradeWords.length;

  if (totalCount === 0) {
    return { totalCount: 0, memorizedCount: 0, unknownCount: 0, unseenCount: 0, progress: 0 };
  }

  // 2. 사용자의 단어 상태 가져오기
  const { data: statusData } = await supabase
    .from('user_word_status')
    .select('word_id, status')
    .eq('user_id', userId);

  const statusMap = new Map<number, string>();
  statusData?.forEach(item => {
    statusMap.set(item.word_id, item.status);
  });

  // 3. 통계 계산
  let memorizedCount = 0;
  let unknownCount = 0;
  let unseenCount = 0;

  targetGradeWords.forEach(word => {
    const status = statusMap.get(word.id);
    if (status === 'memorized') {
      memorizedCount++;
    } else if (status === 'unknown') {
      unknownCount++;
    } else {
      unseenCount++;
    }
  });

  const progress = Math.round((memorizedCount / totalCount) * 100);

  return {
    totalCount,
    memorizedCount,
    unknownCount,
    unseenCount,
    progress
  };
}
