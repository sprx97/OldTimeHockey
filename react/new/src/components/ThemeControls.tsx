import { Select, Switch, Group, useMantineColorScheme } from '@mantine/core'
import { useTheme } from '../contexts/ThemeContext'
import { NHLTeam } from '../types/theme'
import { NHL_TEAM_COLORS } from '../constants/nhlColors'

export function ThemeControls() {
  const { theme, setThemeMode, setTeamTheme } = useTheme()
  const { setColorScheme } = useMantineColorScheme()

  const handleThemeToggle = (checked: boolean) => {
    const newMode = checked ? 'dark' : 'light'
    setThemeMode(newMode)
    setColorScheme(newMode)
  }

  const teamOptions = Object.keys(NHL_TEAM_COLORS).map((team) => ({
    value: team,
    label: team,
  }))

  return (
    <Group>
      <Switch
        checked={theme.mode === 'dark'}
        onChange={(event) => handleThemeToggle(event.currentTarget.checked)}
        label='Dark mode'
      />
      <Select
        label='Team Theme'
        placeholder='Select a team'
        value={theme.team}
        onChange={(value) => setTeamTheme(value as NHLTeam)}
        data={teamOptions}
        clearable
        style={{ minWidth: 200 }}
      />
    </Group>
  )
}
