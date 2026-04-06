import { useState } from 'react';
import Papa from 'papaparse';
import { useVocaStore } from '@/store/useVocaStore';

interface CsvRow {
  Word: string;
  Meaning: string;
}

export const useCsvParser = () => {
  const [error, setError] = useState<string | null>(null);
  const setFileData = useVocaStore((state) => state.setFileData);

  const parseFile = (file: File) => {
    setError(null);
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('CSV 파싱 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
          console.error(results.errors);
          return;
        }
        
        const parsedWords = results.data
          .filter(row => row.Word && row.Meaning)
          .map(row => ({
            word: String(row.Word).trim(),
            meaning: String(row.Meaning).trim(),
          }));

        if (parsedWords.length === 0) {
          setError('유효한 단어 데이터가 없습니다. (CSV 헤더에 Word, Meaning 열이 있는지 확인해주세요)');
        } else {
          setFileData(parsedWords);
        }
      },
      error: (e) => {
        setError(`파일을 읽는 중 문제가 발생했습니다: ${e.message}`);
      }
    });
  };

  return { parseFile, error, setError };
};
