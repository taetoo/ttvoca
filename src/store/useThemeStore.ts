import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // 초기값은 SSR 환경을 고려하여 false로 설정하고, 
      // 클라이언트 마운트 시 브라우저 설정을 감지하여 업데이트하는 로직을 컴포넌트 레벨에서 권장
      isDarkMode: false, 
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setTheme: (isDark) => set({ isDarkMode: isDark }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
