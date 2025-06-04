import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from 'react'
import {
  MantineProvider,
  createTheme,
  localStorageColorSchemeManager,
  type MantineColorsTuple,
  type MantineThemeOverride,
  type MantineTheme,
} from '@mantine/core'
import { NHL_TEAM_COLORS } from '../constants/nhlColors'
import { ThemeConfig, ThemeMode, NHLTeam } from '../types/theme'

interface ThemeContextType {
  theme: ThemeConfig
  setThemeMode: (mode: ThemeMode) => void
  setTeamTheme: (team: NHLTeam | undefined) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Helper function to generate color shades
const generateColorShades = (hexColor: string): MantineColorsTuple => {
  // Convert hex to RGB for manipulation
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)

  // Generate shades by adjusting brightness
  return [
    adjustBrightness(r, g, b, 0.9), // Lightest
    adjustBrightness(r, g, b, 0.7),
    adjustBrightness(r, g, b, 0.5),
    adjustBrightness(r, g, b, 0.3),
    adjustBrightness(r, g, b, 0.1),
    hexColor, // Base color
    adjustBrightness(r, g, b, -0.1),
    adjustBrightness(r, g, b, -0.3),
    adjustBrightness(r, g, b, -0.5),
    adjustBrightness(r, g, b, -0.7), // Darkest
  ] as MantineColorsTuple
}

// Helper function to adjust RGB brightness
const adjustBrightness = (
  r: number,
  g: number,
  b: number,
  factor: number
): string => {
  const adjust = (value: number): number => {
    if (factor > 0) {
      // Lighten: blend with white
      return Math.round(value + (255 - value) * factor)
    } else {
      // Darken: blend with black
      return Math.round(value * (1 + factor))
    }
  }

  const newR = adjust(r)
  const newG = adjust(g)
  const newB = adjust(b)

  return `#${newR.toString(16).padStart(2, '0')}${newG
    .toString(16)
    .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'oth-color-scheme',
})

const TEAM_STORAGE_KEY = 'oth-team-theme'

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeConfig>({
    mode: (colorSchemeManager.get('light') === 'dark'
      ? 'dark'
      : 'light') as ThemeMode,
    team: localStorage.getItem(TEAM_STORAGE_KEY) as NHLTeam | undefined,
  })

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }))
    colorSchemeManager.set(mode)
  }, [])

  const setTeamTheme = useCallback((team: NHLTeam | undefined) => {
    setTheme((prev) => ({ ...prev, team }))
    if (team) {
      localStorage.setItem(TEAM_STORAGE_KEY, team)
    } else {
      localStorage.removeItem(TEAM_STORAGE_KEY)
    }
  }, [])

  const getMantineTheme = useCallback((): MantineThemeOverride => {
    return createTheme({
      primaryColor: theme.team ? 'team' : 'blue',
      colors: {
        // Default Mantine blue color
        blue: [
          '#e7f5ff',
          '#d0ebff',
          '#a5d8ff',
          '#74c0fc',
          '#4dabf7',
          '#339af0',
          '#228be6',
          '#1c7ed6',
          '#1971c2',
          '#1864ab',
        ] as MantineColorsTuple,
        // Add team colors if selected
        ...(theme.team && {
          team: generateColorShades(NHL_TEAM_COLORS[theme.team].primary),
        }),
      },
      primaryShade: { light: 6, dark: 8 },
      components: {
        AppShell: {
          styles: (theme: MantineTheme) => ({
            header: {
              backgroundColor: theme.colors[theme.primaryColor][6],
              borderBottom: 'none',
            },
          }),
        },

        // Navigation link styles
        Link: {
          styles: ({ radius, fontSizes, spacing, white }: MantineTheme) => ({
            root: {
              '&.nav-link': {
                display: 'inline-flex',
                lineHeight: 1,
                padding: '8px 12px',
                borderRadius: radius.sm,
                textDecoration: 'none',
                color: white,
                fontSize: fontSizes.sm,
                fontWeight: 500,
                fontFamily: 'Anton, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                alignItems: 'center',
                height: '100%',
                margin: '0 10px',
                whiteSpace: 'nowrap',
                transition: 'color 0.3s ease',
              },
              '&.nav-link:hover': {
                color: 'rgba(255, 255, 255, 0.8)',
              },
              '&.mobile-nav-link': {
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                fontSize: fontSizes.md,
                padding: `${spacing.md} ${spacing.lg}`,
                borderRadius: radius.sm,
                fontWeight: 500,
                color: 'var(--mantine-color-text)',
                textDecoration: 'none',
              },
            },
          }),
        },

        // Settings icon styles
        Center: {
          styles: ({ radius }: MantineTheme) => ({
            root: {
              '&.settings-icon': {
                padding: '8px 12px',
                borderRadius: radius.sm,
                cursor: 'pointer',
              },
            },
          }),
        },

        // Mobile menu styles
        Box: {
          styles: ({ radius, fontSizes, spacing }: MantineTheme) => ({
            root: {
              '&.mobile-menu': {
                transition: 'transform 300ms ease',
              },
              '&.mobile-menu-toggle': {
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                fontSize: fontSizes.md,
                padding: `${spacing.md} ${spacing.lg}`,
                borderRadius: radius.sm,
                fontWeight: 500,
                color: 'var(--mantine-color-text)',
                cursor: 'pointer',
                justifyContent: 'space-between',
              },
              '&.submenu-container': {
                overflow: 'hidden',
                transition: 'height 300ms ease',
              },
            },
          }),
        },
      },

      // Custom theme properties
      other: {
        navTransition: 'transform 300ms ease',
        iconStroke: 1.5,
      } as const,
    })
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setThemeMode, setTeamTheme }}>
      <MantineProvider
        theme={getMantineTheme()}
        colorSchemeManager={colorSchemeManager}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  )
}
