import {
  Select,
  Switch,
  Stack,
  useMantineColorScheme,
  Group,
  Box,
  SegmentedControl,
  Text,
} from '@mantine/core'
import { useTheme } from '../contexts/ThemeContext'
import { NHLTeam, ThemeType } from '../types/theme'
import { NHL_TEAM_COLORS } from '../constants/nhlColors'
import { NHL_TEAM_NAMES } from '../constants/nhlTeams'
import { DEFAULT_THEME_COLORS } from '../constants/defaultTheme'
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

  const handleThemeTypeChange = (value: string) => {
    setThemeType(value as ThemeType)
    if (value === 'default') {
      setTeamTheme(undefined)
    }
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
      <Box>
        <Switch
          checked={theme.mode === 'dark'}
          onChange={(event) => handleThemeToggle(event.currentTarget.checked)}
          label={
            <Text
              className={styles.darkModeLabel}
              style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#333333' }}
            >
              Dark mode
            </Text>
          }
          size='md'
          styles={{
            track: {
              backgroundColor: theme.mode === 'dark' ? '#373A40' : '#E9ECEF',
              '&[data-checked]': {
                backgroundColor:
                  theme.type === 'team' && theme.team
                    ? NHL_TEAM_COLORS[theme.team].primary
                    : DEFAULT_THEME_COLORS.primary,
              },
            },
            thumb: {
              backgroundColor: theme.mode === 'dark' ? '#FFFFFF' : '#FFFFFF',
            },
          }}
        />
      </Box>

      <Box>
        <SegmentedControl
          fullWidth
          value={theme.type}
          onChange={handleThemeTypeChange}
          styles={{
            root: {
              backgroundColor: getPageBackgroundColor(),
              border: `1px solid ${theme.mode === 'dark' ? '#373A40' : '#E9ECEF'}`,
              borderRadius: '4px',
            },
            indicator: {
              backgroundColor:
                theme.type === 'team' && theme.team
                  ? NHL_TEAM_COLORS[theme.team].primary
                  : DEFAULT_THEME_COLORS.primary,
              borderRadius: '4px',
            },
            label: {
              color: theme.mode === 'dark' ? '#FFFFFF' : '#333333',
              '&[data-active]': {
                color: theme.mode === 'dark' ? '#FFFFFF' : '#333333',
              },
            },
          }}
          data={[
            {
              value: 'default',
              label: (
                <Group
                  gap='xs'
                  justify='center'
                  className={styles.teamOptionGroup}
                >
                  <span
                    className={styles.segmentedControlLabel}
                    style={{
                      color: theme.mode === 'dark' ? '#FFFFFF' : '#333333',
                    }}
                  >
                    Default
                  </span>
                </Group>
              ),
            },
            {
              value: 'team',
              label: (
                <Group
                  gap='xs'
                  justify='center'
                  className={styles.teamOptionGroup}
                >
                  <span
                    className={styles.segmentedControlLabel}
                    style={{
                      color: theme.mode === 'dark' ? '#FFFFFF' : '#333333',
                    }}
                  >
                    Team
                  </span>
                </Group>
              ),
            },
          ]}
        />
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
