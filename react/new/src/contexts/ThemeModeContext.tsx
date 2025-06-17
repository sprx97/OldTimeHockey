import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { ThemeMode } from '../types/theme'

interface ThemeModeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(
  undefined
)

interface ThemeModeProviderProps {
  children: ReactNode
  initialMode?: ThemeMode
}

export function ThemeModeProvider({
  children,
  initialMode = 'light',
}: ThemeModeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode)

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem('theme-mode', newMode)
  }, [])

  const toggleMode = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light'
    setMode(newMode)
  }, [mode, setMode])

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext)
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider')
  }
  return context
}
