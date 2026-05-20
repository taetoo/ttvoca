import { getFlatWords } from './words';
import { useWordStatusStore } from '@/store/wordStatusStore';

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
export async function fetchUserStats(targetScore: number): Promise<UserStats> {
  // 1. 해당 grade의 전체 단어 리스트 가져오기
  const allWords = getFlatWords();
  const targetGradeWords = allWords.filter(w => w.grade?.includes(targetScore.toString()));
  const totalCount = targetGradeWords.length;

  if (totalCount === 0) {
    return { totalCount: 0, memorizedCount: 0, unknownCount: 0, unseenCount: 0, progress: 0 };
  }

  // 2. 사용자의 단어 상태 가져오기 (Zustand 스토어에서 조회)
  const statuses = useWordStatusStore.getState().statuses;

  // 3. 통계 계산
  let memorizedCount = 0;
  let unknownCount = 0;
  let unseenCount = 0;

  targetGradeWords.forEach(word => {
    const status = statuses[word.id];
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

