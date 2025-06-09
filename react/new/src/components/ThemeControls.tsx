import {
  Select,
  Stack,
  useMantineColorScheme,
  Group,
  Box,
  Button,
  Text,
} from '@mantine/core'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../contexts/ThemeContext'
import { NHLTeam } from '../types/theme'
import { NHL_TEAM_COLORS } from '../constants/nhlColors'
import { NHL_TEAM_NAMES } from '../constants/nhlTeams'
import { TEAM_LOGOS } from '../constants/teamLogos'
import styles from './themeControls.module.scss'

export function ThemeControls() {
  const {
    theme,
    setThemeMode,
    setThemeType,
    setTeamTheme,
    getAccessibleLinkColor,
  } = useTheme()

  const getPageBackgroundColor = () => {
    return theme.mode === 'dark' ? '#242424' : '#f5f5f5'
  }

  const { setColorScheme } = useMantineColorScheme()

  const handleThemeToggle = (checked: boolean) => {
    const newMode = checked ? 'dark' : 'light'
    setThemeMode(newMode)
    setColorScheme(newMode)
  }

  const handleTeamChange = (value: string | null) => {
    if (value) {
      setTeamTheme(value as NHLTeam)
      setThemeType('team')
    } else {
      setTeamTheme(undefined)
      setThemeType('default')
    }
  }

  const teamOptions = Object.entries(NHL_TEAM_NAMES).map(([code, name]) => ({
    value: code,
    label: name,
    color: NHL_TEAM_COLORS[code as NHLTeam].primary,
    logo: TEAM_LOGOS[code],
  }))

  return (
    <Stack
      gap='md'
      miw={250}
      className={styles.container}
      style={{
        backgroundColor: 'transparent',
      }}
    >
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '10px',
        }}
      >
        <ThemeToggle
          checked={theme.mode === 'dark'}
          onChange={handleThemeToggle}
        />
      </Box>

      <Box>
        <Button
          fullWidth
          disabled={theme.type === 'default'}
          variant={theme.type === 'default' ? 'light' : 'filled'}
          color={theme.type === 'default' ? 'gray' : 'orange'}
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
            style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#333333' }}
          >
            Team Theme
          </Text>
        }
        placeholder='Select a team'
        style={{ color: getAccessibleLinkColor() }}
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
  )
}
