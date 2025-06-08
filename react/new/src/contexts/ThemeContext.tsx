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
import { DEFAULT_THEME_COLORS } from '../constants/defaultTheme'
import { ThemeConfig, ThemeMode, NHLTeam, ThemeType } from '../types/theme'
import { getLuminance, hexToRgb } from '../utils/colorUtils'

interface ThemeContextType {
  theme: ThemeConfig
  setThemeMode: (mode: ThemeMode) => void
  setThemeType: (type: ThemeType) => void
  setTeamTheme: (team: NHLTeam | undefined) => void
  getHeaderBackgroundColor: () => string
  getHeaderTextColor: () => string
  getLinkHoverColor: () => string
  getAccessibleLinkColor: () => string
  getAccessibleActiveLinkColor: () => string
  getAccessibleHoverLinkColor: () => string
  getMainBackgroundColor: () => string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

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
const THEME_TYPE_STORAGE_KEY = 'oth-theme-type'

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const storedTeam = localStorage.getItem(TEAM_STORAGE_KEY) as
    | NHLTeam
    | undefined
  const validTeam =
    storedTeam && NHL_TEAM_COLORS[storedTeam] ? storedTeam : undefined

  if (storedTeam && !validTeam) {
    localStorage.removeItem(TEAM_STORAGE_KEY)
    localStorage.setItem(THEME_TYPE_STORAGE_KEY, 'default')
  }

  const [theme, setTheme] = useState<ThemeConfig>({
    mode: (colorSchemeManager.get('light') === 'dark'
      ? 'dark'
      : 'light') as ThemeMode,
    type: validTeam
      ? 'team'
      : (localStorage.getItem(THEME_TYPE_STORAGE_KEY) as ThemeType) ||
        'default',
    team: validTeam,
  })

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }))
    colorSchemeManager.set(mode)
  }, [])

  const setThemeType = useCallback((type: ThemeType) => {
    setTheme((prev) => ({ ...prev, type }))
    localStorage.setItem(THEME_TYPE_STORAGE_KEY, type)
  }, [])

  const setTeamTheme = useCallback((team: NHLTeam | undefined) => {
    setTheme((prev) => ({ ...prev, team, type: team ? 'team' : 'default' }))
    if (team) {
      localStorage.setItem(TEAM_STORAGE_KEY, team)
      localStorage.setItem(THEME_TYPE_STORAGE_KEY, 'team')
    } else {
      localStorage.removeItem(TEAM_STORAGE_KEY)
      localStorage.setItem(THEME_TYPE_STORAGE_KEY, 'default')
    }
  }, [])

  const getHeaderBackgroundColor = useCallback((): string => {
    if (theme.type === 'default') {
      return theme.mode === 'light' ? '#f5f5f5' : '#000000'
    } else if (theme.type === 'team' && theme.team) {
      return NHL_TEAM_COLORS[theme.team].primary || DEFAULT_THEME_COLORS.primary
    }
    return DEFAULT_THEME_COLORS.primary
  }, [theme])

  const getHeaderTextColor = useCallback((): string => {
    if (theme.type === 'default') {
      return theme.mode === 'light' ? '#333333' : '#FFFFFF'
    }
    return DEFAULT_THEME_COLORS.secondary || '#FFFFFF'
  }, [theme])

  // Get link hover color
  const getLinkHoverColor = useCallback((): string => {
    if (theme.type === 'default') {
      return DEFAULT_THEME_COLORS.primary // Orange hover for default theme
    } else if (theme.type === 'team' && theme.team) {
      return (
        NHL_TEAM_COLORS[theme.team].secondary || DEFAULT_THEME_COLORS.primary
      )
    }
    return DEFAULT_THEME_COLORS.primary
  }, [theme])

  // Get accessible link color that meets WCAG contrast requirements
  const getAccessibleLinkColor = useCallback((): string => {
    const backgroundColor = getHeaderBackgroundColor()
    const bgLuminance = getLuminance(hexToRgb(backgroundColor))
    // Use white for dark backgrounds, dark gray for light backgrounds
    return bgLuminance < 0.5 ? '#FFFFFF' : '#333333'
  }, [getHeaderBackgroundColor])

  const getAccessibleActiveLinkColor = useCallback((): string => {
    if (theme.type === 'team' && theme.team) {
      return (
        NHL_TEAM_COLORS[theme.team].secondary ||
        NHL_TEAM_COLORS[theme.team].tertiary ||
        DEFAULT_THEME_COLORS.primary
      )
    }

    return DEFAULT_THEME_COLORS.primary
  }, [theme])

  const getAccessibleHoverLinkColor = useCallback((): string => {
    return getAccessibleActiveLinkColor()
  }, [getAccessibleActiveLinkColor])

  const getMainBackgroundColor = useCallback((): string => {
    if (theme.type === 'default') {
      return theme.mode === 'light' ? '#f5f5f5' : '#242424'
    } else if (theme.type === 'team' && theme.team) {
      return theme.mode === 'light' ? '#f5f5f5' : '#242424'
    }
    return theme.mode === 'light' ? '#f5f5f5' : '#242424'
  }, [theme])

  const getMantineTheme = useCallback((): MantineThemeOverride => {
    return createTheme({
      primaryColor: theme.type === 'team' && theme.team ? 'team' : 'default',
      colors: {
        default: generateColorShades(DEFAULT_THEME_COLORS.primary),
        ...(theme.type === 'team' &&
          theme.team && {
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
          styles: ({ radius, fontSizes, spacing }: MantineTheme) => ({
            root: {
              '&.nav-link': {
                display: 'inline-flex',
                lineHeight: 1,
                padding: '8px 12px',
                borderRadius: radius.sm,
                textDecoration: 'none',
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
              '&.mobile-nav-link': {
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                fontSize: fontSizes.md,
                padding: `${spacing.md} ${spacing.lg}`,
                borderRadius: radius.sm,
                fontWeight: 500,
                fontFamily: 'Anton, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textDecoration: 'none',
                borderBottom: '15px',
              },
            },
          }),
        },

        // Menu styles for navigation
        Menu: {
          styles: () => ({
            dropdown: {
              border: 'none',
              borderRadius: 0,
              marginTop: 10,
              padding: '8px 0',
              transformOrigin: 'top right',
            },
            item: {
              padding: '8px 12px',
              fontFamily: 'Inter, sans-serif',
              '&:hover': {
                backgroundColor: 'transparent',
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
    <ThemeContext.Provider
      value={{
        theme,
        setThemeMode,
        setThemeType,
        setTeamTheme,
        getHeaderBackgroundColor,
        getHeaderTextColor,
        getLinkHoverColor,
        getAccessibleLinkColor,
        getAccessibleActiveLinkColor,
        getAccessibleHoverLinkColor,
        getMainBackgroundColor,
      }}
    >
      <MantineProvider
        theme={getMantineTheme()}
        colorSchemeManager={colorSchemeManager}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  )
}
