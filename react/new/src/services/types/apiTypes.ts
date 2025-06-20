export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// League & Division Management
export interface League {
  id: number
  name: string
  tier: number
  division: string
  year: number
}

export interface Team {
  id: number
  name: string
  owner: string
  leagueId: number
  division?: string
  logoUrl?: string
}

export interface LeagueRank {
  leagueId: number
  leagueName: string
  tier: number
  division: string
  rank: number
  totalLeagues: number
}

// Standings & Playoffs
export interface StandingsEntry {
  teamId: number
  teamName: string
  owner: string
  wins: number
  losses: number
  ties: number
  winPct: number
  pointsFor: number
  pointsAgainst: number
  streak: string
  waiver: number
  moves: number
}

export interface PlayoffOdds {
  teamId: number
  teamName: string
  owner: string
  playoffPct: number
  byePct: number
  champPct: number
  avgSeed: number
  avgDraftPos?: number
}

export interface CurrentTier {
  year: number
  tier: number
  week: number
  isPlayoffs: boolean
}

// Leaderboard & Statistics
export interface LeaderboardEntry {
  rank: number
  teamId: number
  teamName: string
  owner: string
  value: number
  seasons: number
  years: string[]
}

export interface WeekInfo {
  currentWeek: number
  totalWeeks: number
  isPlayoffs: boolean
  year: number
}

export interface YearInfo {
  currentYear: number
  availableYears: number[]
}

// ADP
export interface AdpEntry {
  rank: number
  playerId: number
  playerName: string
  position: string
  team: string
  adp: number
  timesSelected: number
  percentage: number
}

// Hall of Fame
export interface RecordEntry {
  rank: number
  teamId: number
  teamName: string
  owner: string
  value: number
  year?: number
  season?: string
  context?: string
}

export interface CareerRecord extends RecordEntry {
  seasons: number
  years: string[]
  avgPerSeason?: number
}

export interface SeasonRecord extends RecordEntry {
  year: number
  week?: number
  isPlayoffs?: boolean
}

// API Response Types (what endpoints actually return)
export type DivisionLeaguesResponse = ApiResponse<League[]>
export type LeagueTeamsResponse = ApiResponse<Team[]>
export type LeagueRanksResponse = ApiResponse<LeagueRank[]>
export type StandingsResponse = ApiResponse<StandingsEntry[]>
export type PlayoffOddsResponse = ApiResponse<PlayoffOdds[]>
export type CurrentTierResponse = ApiResponse<CurrentTier>
export type LeadersResponse = ApiResponse<LeaderboardEntry[]>
export type WeekResponse = ApiResponse<WeekInfo>
export type YearResponse = ApiResponse<YearInfo>
export type AdpResponse = ApiResponse<AdpEntry[]>
export type CareerRecordsResponse = ApiResponse<CareerRecord[]>
export type SeasonRecordsResponse = ApiResponse<SeasonRecord[]>

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, unknown>
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

export interface RequestState<T> {
  data: T | null
  status: RequestStatus
  error: ApiError | null
  lastFetched?: Date
}
