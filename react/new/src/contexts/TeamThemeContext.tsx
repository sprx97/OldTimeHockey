import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { NHLTeam, ThemeType } from '../types/theme'

interface TeamThemeContextType {
  type: ThemeType
  team?: NHLTeam
  setThemeType: (type: ThemeType) => void
  setTeamTheme: (team?: NHLTeam) => void
  resetToDefault: () => void
}

const TeamThemeContext = createContext<TeamThemeContextType | undefined>(
  undefined
)

interface TeamThemeProviderProps {
  children: ReactNode
  initialType?: ThemeType
  initialTeam?: NHLTeam
}

export function TeamThemeProvider({
  children,
  initialType = 'default',
  initialTeam,
}: TeamThemeProviderProps) {
  const [type, setTypeState] = useState<ThemeType>(initialType)
  const [team, setTeamState] = useState<NHLTeam | undefined>(initialTeam)

  const setThemeType = useCallback((newType: ThemeType) => {
    setTypeState(newType)
    localStorage.setItem('theme-type', newType)

    if (newType === 'default') {
      setTeamState(undefined)
      localStorage.removeItem('theme-team')
    }
  }, [])

  const setTeamTheme = useCallback((newTeam?: NHLTeam) => {
    setTeamState(newTeam)

    if (newTeam) {
      setTypeState('team')
      localStorage.setItem('theme-type', 'team')
      localStorage.setItem('theme-team', newTeam)
    } else {
      localStorage.removeItem('theme-team')
    }
  }, [])

  const resetToDefault = useCallback(() => {
    setTypeState('default')
    setTeamState(undefined)
    localStorage.setItem('theme-type', 'default')
    localStorage.removeItem('theme-team')
  }, [])

  return (
    <TeamThemeContext.Provider
      value={{
        type,
        team,
        setThemeType,
        setTeamTheme,
        resetToDefault,
      }}
    >
      {children}
    </TeamThemeContext.Provider>
  )
}

export function useTeamTheme() {
  const context = useContext(TeamThemeContext)
  if (context === undefined) {
    throw new Error('useTeamTheme must be used within a TeamThemeProvider')
  }
  return context
}
