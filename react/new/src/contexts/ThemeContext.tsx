import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import {
  MantineProvider,
  createTheme,
  localStorageColorSchemeManager,
  type MantineThemeOverride,
  type MantineTheme,
} from '@mantine/core'
import { NHL_TEAM_COLORS } from '../constants/nhlColors'
import { DEFAULT_THEME_COLORS } from '../constants/defaultTheme'
import { ThemeConfig, ThemeMode, NHLTeam, ThemeType } from '../types/theme'
import { getLuminance, hexToRgb } from '../utils/colorUtils'
import { generateColorShades } from '../utils/themeUtils'

interface ThemeColors {
  headerBackground: string
  headerText: string
  mainBackground: string
  linkColor: string
  activeLinkColor: string
  hoverLinkColor: string
}

interface ThemeContextType {
  theme: ThemeConfig
  colors: ThemeColors
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  setTeam: (team: NHLTeam | undefined) => void
  resetToDefault: () => void
}

type ThemeAction =
  | { type: 'INITIALIZE'; payload: ThemeConfig }
  | { type: 'SET_MODE'; payload: ThemeMode }
  | { type: 'SET_TEAM'; payload: NHLTeam | undefined }
  | { type: 'TOGGLE_MODE' }
  | { type: 'RESET_TO_DEFAULT' }

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'oth-color-scheme',
})

const TEAM_STORAGE_KEY = 'oth-team-theme'
const THEME_TYPE_STORAGE_KEY = 'oth-theme-type'

const getHeaderBackgroundColor = (theme: ThemeConfig): string => {
  if (theme.type === 'default') {
    return theme.mode === 'light' ? '#f5f5f5' : '#000000'
  } else if (theme.type === 'team' && theme.team) {
    return NHL_TEAM_COLORS[theme.team].primary || DEFAULT_THEME_COLORS.primary
  }
  return DEFAULT_THEME_COLORS.primary
}

const getHeaderTextColor = (theme: ThemeConfig): string => {
  if (theme.type === 'default') {
    return theme.mode === 'light' ? '#333333' : '#FFFFFF'
  }
  return DEFAULT_THEME_COLORS.secondary || '#FFFFFF'
}

const getMainBackgroundColor = (theme: ThemeConfig): string => {
  return theme.mode === 'light' ? '#f5f5f5' : '#242424'
}

const getAccessibleLinkColor = (backgroundColor: string): string => {
  const bgLuminance = getLuminance(hexToRgb(backgroundColor))
  return bgLuminance < 0.5 ? '#FFFFFF' : '#333333'
}

const getAccessibleActiveLinkColor = (theme: ThemeConfig): string => {
  if (theme.type === 'team' && theme.team) {
    return (
      NHL_TEAM_COLORS[theme.team].secondary ||
      NHL_TEAM_COLORS[theme.team].tertiary ||
      DEFAULT_THEME_COLORS.primary
    )
  }
  return DEFAULT_THEME_COLORS.primary
}

const getButtonColors = (theme: ThemeConfig) => {
  const primaryColor =
    theme.type === 'team' && theme.team
      ? NHL_TEAM_COLORS[theme.team].primary
      : DEFAULT_THEME_COLORS.primary

  const secondaryColor =
    theme.type === 'team' && theme.team
      ? NHL_TEAM_COLORS[theme.team].secondary ||
        NHL_TEAM_COLORS[theme.team].tertiary ||
        '#000'
      : DEFAULT_THEME_COLORS.tertiary

  if (theme.mode === 'light') {
    return {
      primaryBg: secondaryColor,
      primaryText: '#fff',
      primaryHoverBg: primaryColor,
      primaryHoverText: '#fff',
      secondaryBg: '#fff',
      secondaryText: secondaryColor,
      secondaryBorder: secondaryColor,
      secondaryHoverBg: primaryColor,
      secondaryHoverText: '#fff',
      secondaryHoverBorder: primaryColor,
    }
  } else {
    return {
      primaryBg: '#fff',
      primaryText: '#000',
      primaryHoverBg: primaryColor,
      primaryHoverText: '#fff',
      secondaryBg: 'transparent',
      secondaryText: '#fff',
      secondaryBorder: '#fff',
      secondaryHoverBg: primaryColor,
      secondaryHoverText: '#fff',
      secondaryHoverBorder: primaryColor,
    }
  }
}

const computeThemeColors = (theme: ThemeConfig): ThemeColors => {
  const headerBackground = getHeaderBackgroundColor(theme)
  const activeLinkColor = getAccessibleActiveLinkColor(theme)

  return {
    headerBackground,
    headerText: getHeaderTextColor(theme),
    mainBackground: getMainBackgroundColor(theme),
    linkColor: getAccessibleLinkColor(headerBackground),
    activeLinkColor,
    hoverLinkColor: activeLinkColor,
  }
}

const themeReducer = (state: ThemeConfig, action: ThemeAction): ThemeConfig => {
  switch (action.type) {
    case 'INITIALIZE':
      return action.payload

    case 'SET_MODE':
      return { ...state, mode: action.payload }

    case 'SET_TEAM':
      return {
        ...state,
        team: action.payload,
        type: action.payload ? 'team' : 'default',
      }

    case 'TOGGLE_MODE':
      return { ...state, mode: state.mode === 'light' ? 'dark' : 'light' }

    case 'RESET_TO_DEFAULT':
      return { ...state, type: 'default', team: undefined }

    default:
      return state
  }
}

const safeLocalStorage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Silently fail
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  },
}

const initializeTheme = (): ThemeConfig => {
  const storedTeam = safeLocalStorage.get(TEAM_STORAGE_KEY) as NHLTeam | null
  const validTeam =
    storedTeam && NHL_TEAM_COLORS[storedTeam] ? storedTeam : undefined

  if (storedTeam && !validTeam) {
    safeLocalStorage.remove(TEAM_STORAGE_KEY)
    safeLocalStorage.set(THEME_TYPE_STORAGE_KEY, 'default')
  }

  const mode = (
    colorSchemeManager.get('light') === 'dark' ? 'dark' : 'light'
  ) as ThemeMode
  const type = validTeam
    ? 'team'
    : (safeLocalStorage.get(THEME_TYPE_STORAGE_KEY) as ThemeType) || 'default'

  return { mode, type, team: validTeam }
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, dispatch] = useReducer(themeReducer, initializeTheme())

  const colors = useMemo(() => computeThemeColors(theme), [theme])
  const buttonColors = useMemo(() => getButtonColors(theme), [theme])

  useEffect(() => {
    colorSchemeManager.set(theme.mode)
  }, [theme.mode])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty(
      '--color-button-primary-bg',
      buttonColors.primaryBg || '#000'
    )
    root.style.setProperty(
      '--color-button-primary-text',
      buttonColors.primaryText || '#fff'
    )
    root.style.setProperty(
      '--color-button-primary-hover-bg',
      buttonColors.primaryHoverBg || '#fe5900'
    )
    root.style.setProperty(
      '--color-button-primary-hover-text',
      buttonColors.primaryHoverText || '#fff'
    )
    root.style.setProperty(
      '--color-button-secondary-bg',
      buttonColors.secondaryBg || '#fff'
    )
    root.style.setProperty(
      '--color-button-secondary-text',
      buttonColors.secondaryText || '#000'
    )
    root.style.setProperty(
      '--color-button-secondary-border',
      buttonColors.secondaryBorder || '#000'
    )
    root.style.setProperty(
      '--color-button-secondary-hover-bg',
      buttonColors.secondaryHoverBg || '#fe5900'
    )
    root.style.setProperty(
      '--color-button-secondary-hover-text',
      buttonColors.secondaryHoverText || '#fff'
    )
    root.style.setProperty(
      '--color-button-secondary-hover-border',
      buttonColors.secondaryHoverBorder || '#fe5900'
    )

    const heroTitleColor =
      theme.type === 'team' && theme.team
        ? NHL_TEAM_COLORS[theme.team].primary
        : '#000'
    root.style.setProperty('--color-hero-title', heroTitleColor)
  }, [buttonColors, theme])

  useEffect(() => {
    if (theme.team) {
      safeLocalStorage.set(TEAM_STORAGE_KEY, theme.team)
      safeLocalStorage.set(THEME_TYPE_STORAGE_KEY, 'team')
    } else {
      safeLocalStorage.remove(TEAM_STORAGE_KEY)
      safeLocalStorage.set(THEME_TYPE_STORAGE_KEY, theme.type)
    }
  }, [theme.team, theme.type])

  const setMode = (mode: ThemeMode) => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }

  const toggleMode = () => {
    dispatch({ type: 'TOGGLE_MODE' })
  }

  const setTeam = (team: NHLTeam | undefined) => {
    dispatch({ type: 'SET_TEAM', payload: team })
  }

  const resetToDefault = () => {
    dispatch({ type: 'RESET_TO_DEFAULT' })
  }

  const getMantineTheme = useMemo((): MantineThemeOverride => {
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

      other: {
        navTransition: 'transform 300ms ease',
        iconStroke: 1.5,
      } as const,
    })
  }, [theme])

  const contextValue = useMemo(
    () => ({
      theme,
      colors,
      setMode,
      toggleMode,
      setTeam,
      resetToDefault,
    }),
    [theme, colors]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <MantineProvider
        theme={getMantineTheme}
        colorSchemeManager={colorSchemeManager}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  )
}
