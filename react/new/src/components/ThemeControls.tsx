import {
  Select,
  Stack,
  useMantineColorScheme,
  Group,
  Box,
  Text,
} from '@mantine/core'
import { Button } from '@/components/Button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import { NHLTeam } from '@/types/theme'
import { NHL_TEAM_COLORS } from '@/constants/nhlColors'
import { NHL_TEAM_NAMES } from '@/constants/nhlTeams'
import { TEAM_LOGOS } from '@/constants/teamLogos'
import styles from './themeControls.module.scss'

interface ThemeControlsProps {
  variant?: 'mobile' | 'desktop'
}

export function ThemeControls({ variant = 'mobile' }: ThemeControlsProps) {
  const { theme, colors, setMode, setTeam } = useTheme()

  const getPageBackgroundColor = () => {
    return theme.mode === 'dark' ? '#242424' : '#f5f5f5'
  }

  const { setColorScheme } = useMantineColorScheme()

  const handleThemeToggle = (checked: boolean) => {
    const newMode = checked ? 'dark' : 'light'
    setMode(newMode)
    setColorScheme(newMode)
  }

  const handleTeamChange = (value: string | null) => {
    if (value) {
      setTeam(value as NHLTeam)
    } else {
      setTeam(undefined)
    }
  }

  const teamOptions = Object.entries(NHL_TEAM_NAMES).map(([code, name]) => ({
    value: code,
    label: name,
    color: NHL_TEAM_COLORS[code as NHLTeam].primary,
    logo: TEAM_LOGOS[code],
  }))

  const isDesktop = variant === 'desktop'
  const headerPadding = isDesktop ? '8px' : '15px 20px'

  return (
    <Box style={{ backgroundColor: 'transparent', position: 'relative' }}>
      <Text
        fw={isDesktop ? 400 : 600}
        size='md'
        style={{
          color: theme.mode === 'dark' ? '#FFFFFF' : '#333333',
          marginBottom: isDesktop ? '5px' : '15px',
          textAlign: isDesktop ? 'center' : 'left',
          width: '100%',
          backgroundColor: isDesktop
            ? 'transparent'
            : theme.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.3)'
              : 'rgba(0, 0, 0, 0.05)',
          padding: headerPadding,
          fontSize: isDesktop ? '1rem' : '1.15rem',
          fontFamily: isDesktop ? 'Anton, sans-serif' : 'inherit',
          textTransform: isDesktop ? 'uppercase' : 'none',
        }}
      >
        Theme Settings
      </Text>

      <Box style={{ padding: isDesktop ? '0' : '0 20px' }}>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '-15px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <ThemeToggle
            checked={theme.mode === 'dark'}
            onChange={handleThemeToggle}
          />
        </Box>

        <Stack
          gap='md'
          className={styles.container}
          style={{
            backgroundColor: 'transparent',
            padding: '35px 20px 20px 20px',
            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}`,
            borderRadius: '8px',
          }}
        >
          <Box>
            <Button
              style={{ width: '100%' }}
              disabled={theme.type === 'default'}
              variant='primary'
              onClick={() => {
                handleTeamChange(null)
              }}
            >
              OTH Theme
            </Button>
          </Box>

          <Select
            label={
              <Text
                className={styles.teamLabel}
                style={{
                  color: theme.mode === 'dark' ? '#FFFFFF' : '#333333',
                  textAlign: 'center',
                  paddingBottom: isDesktop ? '5px' : '0',
                }}
              >
                Team Theme
              </Text>
            }
            placeholder='Select a team'
            style={{ color: colors.linkColor }}
            value={theme.team}
            onChange={handleTeamChange}
            data={teamOptions}
            clearable
            searchable
            renderOption={({ option, ...others }) => {
              const teamOption = option as (typeof teamOptions)[0]
              return (
                <Group gap='xs' {...others}>
                  <img
                    src={teamOption.logo}
                    width={24}
                    height={24}
                    alt={`${teamOption.label} logo`}
                    className={styles.teamLogo}
                  />
                  <span className={styles.teamOption}>{teamOption.label}</span>
                </Group>
              )
            }}
            leftSection={
              theme.team ? (
                <img
                  src={TEAM_LOGOS[theme.team]}
                  width={20}
                  height={20}
                  alt={`${NHL_TEAM_NAMES[theme.team]} logo`}
                  className={styles.teamLogo}
                />
              ) : null
            }
            comboboxProps={{
              transitionProps: { transition: 'pop', duration: 200 },
            }}
            styles={() => {
              const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#333333'
              return {
                dropdown: {
                  backgroundColor: getPageBackgroundColor(),
                },
                input: {
                  color: textColor,
                  fontSize: '14px',
                  '&::placeholder': {
                    color: textColor,
                    fontSize: '14px',
                  },
                  '& *': {
                    color: textColor,
                  },
                },
                option: {
                  color: textColor,
                  '&[data-selected]': {
                    color: textColor,
                  },
                  '&[data-hovered]': {
                    color: textColor,
                  },
                  '& *': {
                    color: textColor,
                  },
                },
                item: {
                  color: textColor,
                  '&[data-selected]': {
                    color: textColor,
                  },
                  '&[data-hovered]': {
                    color: textColor,
                  },
                  '& *': {
                    color: textColor,
                  },
                },
                value: {
                  color: textColor,
                  '& *': {
                    color: textColor,
                  },
                },
                placeholder: {
                  color: textColor,
                  '& *': {
                    color: textColor,
                  },
                },
                wrapper: {
                  '& *': {
                    color: textColor,
                  },
                },
                root: {
                  '& *': {
                    color: textColor,
                  },
                },
                section: {
                  color: textColor,
                },
                rightSection: {
                  color: textColor,
                },
                leftSection: {
                  color: textColor,
                },
              }
            }}
          />
        </Stack>
      </Box>
    </Box>
  )
}
