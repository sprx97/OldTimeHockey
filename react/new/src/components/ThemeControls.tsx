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

import anaheimLogo from '../assets/logos/nhl/anaheim_ducks.png'
import bostonLogo from '../assets/logos/nhl/boston_bruins.png'
import buffaloLogo from '../assets/logos/nhl/buffalo_sabres.png'
import calgaryLogo from '../assets/logos/nhl/calgary_flames.png'
import carolinaLogo from '../assets/logos/nhl/carolina_hurricanes.png'
import chicagoLogo from '../assets/logos/nhl/chicago_blackhawks.png'
import coloradoLogo from '../assets/logos/nhl/colorado_avalanche.png'
import columbusLogo from '../assets/logos/nhl/columbus_blue_jackets.png'
import dallasLogo from '../assets/logos/nhl/dallas_stars.png'
import detroitLogo from '../assets/logos/nhl/detroit_redwings.png'
import edmontonLogo from '../assets/logos/nhl/edmonton_oilers.png'
import floridaLogo from '../assets/logos/nhl/florida_panthers.png'
import losAngelesLogo from '../assets/logos/nhl/los_angeles_kings.png'
import minnesotaLogo from '../assets/logos/nhl/minnesota_wild.png'
import montrealLogo from '../assets/logos/nhl/montreal_canadiens.png'
import nashvilleLogo from '../assets/logos/nhl/nashville_predators.png'
import newJerseyLogo from '../assets/logos/nhl/new_jersey_devils.png'
import newYorkIslandersLogo from '../assets/logos/nhl/new_york_islanders.png'
import newYorkRangersLogo from '../assets/logos/nhl/new_york_rangers.png'
import ottawaLogo from '../assets/logos/nhl/ottawa_senators.png'
import philadelphiaLogo from '../assets/logos/nhl/philadelphia_flyers.png'
import pittsburghLogo from '../assets/logos/nhl/pittsburgh_penguins.png'
import sanJoseLogo from '../assets/logos/nhl/san_jose_sharks.png'
import seattleLogo from '../assets/logos/nhl/seattle_kraken.png'
import stLouisLogo from '../assets/logos/nhl/st_louis_blues.png'
import tampaLogo from '../assets/logos/nhl/tampa_lightning.png'
import torontoLogo from '../assets/logos/nhl/toronto_maple_leafs.png'
import utahLogo from '../assets/logos/nhl/utah_hockey_club.png'
import vancouverLogo from '../assets/logos/nhl/vancouver_canucks.png'
import vegasLogo from '../assets/logos/nhl/vegas_golden_knights.png'
import washingtonLogo from '../assets/logos/nhl/washington_capitals.png'
import winnipegLogo from '../assets/logos/nhl/winnipeg_jets.png'

const TEAM_LOGOS: Record<string, string> = {
  ANA: anaheimLogo,
  UTA: utahLogo,
  BOS: bostonLogo,
  BUF: buffaloLogo,
  CGY: calgaryLogo,
  CAR: carolinaLogo,
  CHI: chicagoLogo,
  COL: coloradoLogo,
  CBJ: columbusLogo,
  DAL: dallasLogo,
  DET: detroitLogo,
  EDM: edmontonLogo,
  FLA: floridaLogo,
  LAK: losAngelesLogo,
  MIN: minnesotaLogo,
  MTL: montrealLogo,
  NSH: nashvilleLogo,
  NJD: newJerseyLogo,
  NYI: newYorkIslandersLogo,
  NYR: newYorkRangersLogo,
  OTT: ottawaLogo,
  PHI: philadelphiaLogo,
  PIT: pittsburghLogo,
  SJS: sanJoseLogo,
  SEA: seattleLogo,
  STL: stLouisLogo,
  TBL: tampaLogo,
  TOR: torontoLogo,
  VAN: vancouverLogo,
  VGK: vegasLogo,
  WSH: washingtonLogo,
  WPG: winnipegLogo,
}

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
    logo: TEAM_LOGOS[code],
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
          description='Select your favorite NHL team'
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
                <img
                  src={teamOption.logo}
                  width={24}
                  height={24}
                  alt={`${teamOption.label} logo`}
                  style={{ objectFit: 'contain' }}
                />
                <span>{teamOption.label}</span>
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
                style={{ objectFit: 'contain' }}
              />
            ) : null
          }
          comboboxProps={{
            transitionProps: { transition: 'pop', duration: 200 },
          }}
        />
      )}
    </Stack>
  )
}
