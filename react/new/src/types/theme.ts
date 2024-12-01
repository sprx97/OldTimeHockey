export type ThemeMode = 'light' | 'dark'

export interface TeamColors {
  primary: string
  secondary: string
}

export type NHLTeam =
  | 'ANA'
  | 'ARI'
  | 'BOS'
  | 'BUF'
  | 'CGY'
  | 'CAR'
  | 'CHI'
  | 'COL'
  | 'CBJ'
  | 'DAL'
  | 'DET'
  | 'EDM'
  | 'FLA'
  | 'LAK'
  | 'MIN'
  | 'MTL'
  | 'NSH'
  | 'NJD'
  | 'NYI'
  | 'NYR'
  | 'OTT'
  | 'PHI'
  | 'PIT'
  | 'SJS'
  | 'SEA'
  | 'STL'
  | 'TBL'
  | 'TOR'
  | 'VAN'
  | 'VGK'
  | 'WSH'
  | 'WPG'

export interface ThemeConfig {
  mode: ThemeMode
  team?: NHLTeam
}
