import rawWordsData from '@/data/TOEIC_WORDS_UPDATED.json'

export interface WordItem {
  id: number;
  word: string;
  meaning: string;
  example?: string;
  translation?: string;
  pos?: string;
  grade?: string;
  day?: string;
}

function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash) || 1; // 0이 되는 것을 방지
}

let cachedFlatArray: WordItem[] | null = null;

export function getFlatWords(): WordItem[] {
  if (cachedFlatArray) return cachedFlatArray;

  const flatArray: WordItem[] = []

  // TOEIC_WORDS_UPDATED.json 구조: { "600 grade": { "Day 1": { "word": { meaning, example, translation, pos } } } }
  for (const [grade, days] of Object.entries(rawWordsData)) {
    for (const [day, words] of Object.entries(days as Record<string, Record<string, unknown>>)) {
      for (const [word, details] of Object.entries(words as Record<string, { meaning: string; example?: string; translation?: string; pos?: string }>)) {
        flatArray.push({
          id: hashStringToNumber(`${grade}-${day}-${word}`),
          word,
          meaning: details.meaning,
          example: details.example,
          translation: details.translation,
          pos: details.pos,
          grade,
          day,
        })
      }
    }
  }

  cachedFlatArray = flatArray;
  return flatArray
}

/**
 * 특정 grade + day에 해당하는 단어 목록 반환
 */
export function getWordsByGradeAndDay(grade: string, day: string): WordItem[] {
  return getFlatWords().filter(w => w.grade === grade && w.day === day)
}

/**
 * 특정 grade + day + pos(품사)에 해당하는 단어 목록 반환
 * 퀴즈 오답 선지 생성 시 활용
 */
export function getWordsByPos(grade: string, day: string, pos: string): WordItem[] {
  return getFlatWords().filter(w => w.grade === grade && w.day === day && w.pos === pos)
}
