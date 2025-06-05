import {
  Select,
  Switch,
  Stack,
  useMantineColorScheme,
  Group,
  Box,
  SegmentedControl,
} from '@mantine/core'
import { useTheme } from '../contexts/ThemeContext'
import { NHLTeam, ThemeType } from '../types/theme'
import { NHL_TEAM_COLORS } from '../constants/nhlColors'
import { NHL_TEAM_NAMES } from '../constants/nhlTeams'
import { DEFAULT_THEME_COLORS } from '../constants/defaultTheme'

export function ThemeControls() {
  const { theme, setThemeMode, setThemeType, setTeamTheme } = useTheme()
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

  const teamOptions = Object.entries(NHL_TEAM_NAMES).map(([code, name]) => ({
    value: code,
    label: name,
    color: NHL_TEAM_COLORS[code as NHLTeam].primary,
  }))

  return (
    <Stack gap='md' miw={250}>
      <Box>
        <Switch
          checked={theme.mode === 'dark'}
          onChange={(event) => handleThemeToggle(event.currentTarget.checked)}
          label='Dark mode'
          size='md'
        />
      </Box>

      <Box>
        <SegmentedControl
          fullWidth
          value={theme.type}
          onChange={handleThemeTypeChange}
          data={[
            {
              value: 'default',
              label: (
                <Group gap='xs'>
                  <Box
                    w={16}
                    h={16}
                    style={{
                      backgroundColor: DEFAULT_THEME_COLORS.primary,
                      borderRadius: 'var(--mantine-radius-xs)',
                    }}
                  />
                  <span>Default</span>
                </Group>
              ),
            },
            {
              value: 'team',
              label: (
                <Group gap='xs'>
                  <span>Team</span>
                </Group>
              ),
            },
          ]}
        />
      </Box>

      {theme.type === 'team' && (
        <Select
          label='Team Theme'
          description='Select your favorite NHL team colors'
          placeholder='Select a team'
          value={theme.team}
          onChange={(value) => setTeamTheme(value as NHLTeam)}
          data={teamOptions}
          clearable
          searchable
          renderOption={({ option, ...others }) => {
            const teamOption = option as (typeof teamOptions)[0]
            return (
              <Group gap='xs' {...others}>
                <Box
                  w={16}
                  h={16}
                  style={{
                    backgroundColor: teamOption.color,
                    borderRadius: 'var(--mantine-radius-xs)',
                  }}
                />
                <span>{teamOption.label}</span>
              </Group>
            )
          }}
          comboboxProps={{
            transitionProps: { transition: 'pop', duration: 200 },
          }}
        />
      )}
    </Stack>
  )
}
