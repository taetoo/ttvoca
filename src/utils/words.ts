import rawWordsData from '@/data/words.json'

export interface WordItem {
  id: number;
  word: string;
  meaning: string;
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

  if (Array.isArray(rawWordsData)) {
    cachedFlatArray = rawWordsData as WordItem[]
    return cachedFlatArray
  }

  for (const [grade, days] of Object.entries(rawWordsData)) {
    for (const [day, wordObj] of Object.entries(days as Record<string, Record<string, string>>)) {
      for (const [word, meaning] of Object.entries(wordObj)) {
        flatArray.push({
          id: hashStringToNumber(`${grade}-${day}-${word}`),
          word: word,
          meaning: meaning,
          grade,
          day
        })
      }
    }
  }

  cachedFlatArray = flatArray;
  return flatArray
}
