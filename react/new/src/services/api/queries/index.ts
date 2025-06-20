import {
  buildDivisionLeaguesUrl,
  buildLeagueTeamsUrl,
  buildLeagueRanksUrl,
  buildPlayoffOddsUrl,
  buildCurrentTierUrl,
  buildLeadersUrl,
  buildCurrentWeekUrl,
  buildCurrentYearUrl,
  buildAdpUrl,
  buildCareerRecordUrl,
  buildSeasonRecordUrl,
  type DivisionLeaguesParams,
  type LeagueTeamsParams,
  type PlayoffOddsParams,
  type LeadersParams,
  type AdpParams,
  type RecordParams,
} from '../config/urlBuilder'

import type {
  League,
  Team,
  LeagueRank,
  PlayoffOdds,
  CurrentTier,
  LeaderboardEntry,
  WeekInfo,
  YearInfo,
  AdpEntry,
  CareerRecord,
  SeasonRecord,
} from '../../types'

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  return data
}

export const fetchDivisionLeagues = async (
  params: DivisionLeaguesParams
): Promise<League[]> => {
  const url = buildDivisionLeaguesUrl(params)
  return fetchApi<League[]>(url)
}

export const fetchLeagueTeams = async (
  params: LeagueTeamsParams
): Promise<Team[]> => {
  const url = buildLeagueTeamsUrl(params)
  return fetchApi<Team[]>(url)
}

export const fetchLeagueRanks = async (year: number): Promise<LeagueRank[]> => {
  const url = buildLeagueRanksUrl(year)
  return fetchApi<LeagueRank[]>(url)
}

export const fetchPlayoffOdds = async (
  params: PlayoffOddsParams
): Promise<PlayoffOdds[]> => {
  const url = buildPlayoffOddsUrl(params)
  return fetchApi<PlayoffOdds[]>(url)
}

export const fetchCurrentTier = async (year: number): Promise<CurrentTier> => {
  const url = buildCurrentTierUrl(year)
  return fetchApi<CurrentTier>(url)
}

export const fetchLeaders = async (
  params: LeadersParams
): Promise<LeaderboardEntry[]> => {
  const url = buildLeadersUrl(params)
  return fetchApi<LeaderboardEntry[]>(url)
}

export const fetchCurrentWeek = async (): Promise<WeekInfo> => {
  const url = buildCurrentWeekUrl()
  return fetchApi<WeekInfo>(url)
}

export const fetchCurrentYear = async (): Promise<YearInfo> => {
  const url = buildCurrentYearUrl()
  return fetchApi<YearInfo>(url)
}

export const fetchAdp = async (params: AdpParams): Promise<AdpEntry[]> => {
  const url = buildAdpUrl(params)
  return fetchApi<AdpEntry[]>(url)
}

export const fetchCareerRecords = async (
  recordType: 'wins' | 'winPct' | 'pointsFor' | 'avgPointsFor' | 'coachRating',
  params?: RecordParams
): Promise<CareerRecord[]> => {
  const url = buildCareerRecordUrl(recordType, params)
  return fetchApi<CareerRecord[]>(url)
}

export const fetchSeasonRecords = async (
  recordType: 'wins' | 'winPct' | 'pointsFor' | 'coachRating',
  params?: RecordParams
): Promise<SeasonRecord[]> => {
  const url = buildSeasonRecordUrl(recordType, params)
  return fetchApi<SeasonRecord[]>(url)
}
