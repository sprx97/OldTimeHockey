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

import anaheimLogo from '../assets/logos/nhl/anaheim_ducks.svg'
import bostonLogo from '../assets/logos/nhl/boston_bruins.svg'
import buffaloLogo from '../assets/logos/nhl/buffalo_sabres.svg'
import calgaryLogo from '../assets/logos/nhl/calgary_flames.svg'
import carolinaLogo from '../assets/logos/nhl/carolina_hurricanes.svg'
import chicagoLogo from '../assets/logos/nhl/chicago_blackhawks.svg'
import coloradoLogo from '../assets/logos/nhl/colorado_avalanche.svg'
import columbusLogo from '../assets/logos/nhl/columbus_blue_jackets.svg'
import dallasLogo from '../assets/logos/nhl/dallas_stars.svg'
import detroitLogo from '../assets/logos/nhl/detroit_redwings.svg'
import edmontonLogo from '../assets/logos/nhl/edmonton_oilers.svg'
import floridaLogo from '../assets/logos/nhl/florida_panthers.svg'
import losAngelesLogo from '../assets/logos/nhl/los_angeles_kings.svg'
import minnesotaLogo from '../assets/logos/nhl/minnesota_wild.svg'
import montrealLogo from '../assets/logos/nhl/montreal_canadiens.svg'
import nashvilleLogo from '../assets/logos/nhl/nashville_predators.svg'
import newJerseyLogo from '../assets/logos/nhl/new_jersey_devils.svg'
import newYorkIslandersLogo from '../assets/logos/nhl/new_york_islanders.svg'
import newYorkRangersLogo from '../assets/logos/nhl/new_york_rangers.svg'
import ottawaLogo from '../assets/logos/nhl/ottawa_senators.svg'
import philadelphiaLogo from '../assets/logos/nhl/philadelphia_flyers.svg'
import pittsburghLogo from '../assets/logos/nhl/pittsburgh_penguins.svg'
import sanJoseLogo from '../assets/logos/nhl/san_jose_sharks.svg'
import seattleLogo from '../assets/logos/nhl/seattle_kraken.svg'
import stLouisLogo from '../assets/logos/nhl/st_louis_blues.svg'
import tampaLogo from '../assets/logos/nhl/tampa_lightning.svg'
import torontoLogo from '../assets/logos/nhl/toronto_maple_leafs.svg'
import utahLogo from '../assets/logos/nhl/utah_mammoth.svg'
import vancouverLogo from '../assets/logos/nhl/vancouver_canucks.svg'
import vegasLogo from '../assets/logos/nhl/vegas_golden_knights.svg'
import washingtonLogo from '../assets/logos/nhl/washington_capitals.svg'
import winnipegLogo from '../assets/logos/nhl/winnipeg_jets.svg'

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
  const {
    theme,
    setThemeMode,
    setThemeType,
    setTeamTheme,
    getAccessibleLinkColor,
    getHeaderBackgroundColor,
  } = useTheme()

  // Get page background color based on theme mode
  const getPageBackgroundColor = () => {
    return theme.mode === 'dark' ? '#242424' : '#ffffff'
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
      style={{
        backgroundColor: getHeaderBackgroundColor(),
        padding: '10px',
        borderRadius: '4px',
      }}
    >
      <Box>
        <Switch
          checked={theme.mode === 'dark'}
          onChange={(event) => handleThemeToggle(event.currentTarget.checked)}
          label={
            <Text style={{ color: getAccessibleLinkColor(), fontSize: '14px' }}>
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
              color: getAccessibleLinkColor(),
              '&[data-active]': {
                color: theme.mode === 'dark' ? '#FFFFFF' : '#000000',
              },
            },
          }}
          data={[
            {
              value: 'default',
              label: (
                <Group gap='xs' justify='center' style={{ width: '100%' }}>
                  <span
                    style={{
                      color: getAccessibleLinkColor(),
                      fontSize: '14px',
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
                <Group gap='xs' justify='center' style={{ width: '100%' }}>
                  <span
                    style={{
                      color: getAccessibleLinkColor(),
                      fontSize: '14px',
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

      {theme.type === 'team' && (
        <Select
          label={
            <Text style={{ color: getAccessibleLinkColor(), fontSize: '14px' }}>
              Team Theme
            </Text>
          }
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
                <span
                  style={{ color: getAccessibleLinkColor(), fontSize: '14px' }}
                >
                  {teamOption.label}
                </span>
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
          styles={() => ({
            dropdown: {
              backgroundColor: getPageBackgroundColor(),
            },
            input: {
              color: '#FFFFFF',
              fontSize: '14px',
              '&::placeholder': {
                color: '#FFFFFF',
                fontSize: '14px',
              },
            },
          })}
        />
      )}
    </Stack>
  )
}
