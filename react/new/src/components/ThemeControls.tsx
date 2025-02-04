import {
  Select,
  Switch,
  Stack,
  useMantineColorScheme,
  Group,
  Box,
} from '@mantine/core'
import { useTheme } from '../contexts/ThemeContext'
import { NHLTeam } from '../types/theme'
import { NHL_TEAM_COLORS } from '../constants/nhlColors'
import { NHL_TEAM_NAMES } from '../constants/nhlTeams'

export function ThemeControls() {
  const { theme, setThemeMode, setTeamTheme } = useTheme()
  const { setColorScheme } = useMantineColorScheme()

  const handleThemeToggle = (checked: boolean) => {
    const newMode = checked ? 'dark' : 'light'
    setThemeMode(newMode)
    setColorScheme(newMode)
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
    </Stack>
  )
}
