import { apiConfig, API_ENDPOINTS } from './apiConfig'

/**
 * URL Builder utilities
 * Functions to build complete API URLs with query parameters
 */

export type QueryParams = Record<string, string | number | boolean | undefined>

export interface LeagueTeamsParams extends QueryParams {
  leagueId: number
  year: number
}

export interface DivisionLeaguesParams extends QueryParams {
  year: number
  tiers?: string
}

export interface PlayoffOddsParams extends QueryParams {
  league: number
  year?: number
  week?: number
}

export interface LeadersParams extends QueryParams {
  year: string
  seasons?: string
  tiers?: string
  minseasons?: number
}

export interface AdpParams extends QueryParams {
  year: number
  tiers?: string
}

export interface RecordParams extends QueryParams {
  limit?: number
}

export const buildApiUrl = (endpoint: string, params?: QueryParams): string => {
  const url = new URL(endpoint, apiConfig.baseUrl)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

// League & Division Management
export const buildLeagueTeamsUrl = (params: LeagueTeamsParams) =>
  buildApiUrl(API_ENDPOINTS.leagueTeams, {
    id: params.leagueId,
    year: params.year,
  })

export const buildDivisionLeaguesUrl = (params: DivisionLeaguesParams) =>
  buildApiUrl(API_ENDPOINTS.divisionLeagues, params)

export const buildLeagueRanksUrl = (year: number) =>
  buildApiUrl(API_ENDPOINTS.leagueRanks, { year })

// Standings & Playoff Data
export const buildPlayoffOddsUrl = (params: PlayoffOddsParams) =>
  buildApiUrl(API_ENDPOINTS.playoffOdds, params)

export const buildCurrentTierUrl = (year: number) =>
  buildApiUrl(API_ENDPOINTS.currentTier, { year })

// Leaderboard & Statistics
export const buildLeadersUrl = (params: LeadersParams) =>
  buildApiUrl(API_ENDPOINTS.leaders, params)

export const buildCurrentWeekUrl = () => buildApiUrl(API_ENDPOINTS.getWeek)

export const buildCurrentYearUrl = () => buildApiUrl(API_ENDPOINTS.getYear)

// ADP
export const buildAdpUrl = (params: AdpParams) =>
  buildApiUrl(API_ENDPOINTS.adp, params)

// Hall of Fame Records
export const buildCareerRecordUrl = (
  recordType: 'wins' | 'winPct' | 'pointsFor' | 'avgPointsFor' | 'coachRating',
  params?: RecordParams
) => {
  const endpointMap = {
    wins: API_ENDPOINTS.winsRecord,
    winPct: API_ENDPOINTS.winPctRecord,
    pointsFor: API_ENDPOINTS.pfRecord,
    avgPointsFor: API_ENDPOINTS.avgPfRecord,
    coachRating: API_ENDPOINTS.coachRatingRecord,
  }
  return buildApiUrl(endpointMap[recordType], params)
}

export const buildSeasonRecordUrl = (
  recordType: 'wins' | 'winPct' | 'pointsFor' | 'coachRating',
  params?: RecordParams
) => {
  const endpointMap = {
    wins: API_ENDPOINTS.seasonWinsRecord,
    winPct: API_ENDPOINTS.seasonWinPctRecord,
    pointsFor: API_ENDPOINTS.seasonPfRecord,
    coachRating: API_ENDPOINTS.seasonCoachRatingRecord,
  }
  return buildApiUrl(endpointMap[recordType], params)
}
