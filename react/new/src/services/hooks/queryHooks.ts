import { useQuery } from '@tanstack/react-query'
import { getQueryConfig } from '../api/queryConfig'
import {
  fetchDivisionLeagues,
  fetchLeagueTeams,
  fetchLeagueRanks,
  fetchPlayoffOdds,
  fetchCurrentTier,
  fetchLeaders,
  fetchCurrentWeek,
  fetchCurrentYear,
  fetchAdp,
  fetchCareerRecords,
  fetchSeasonRecords,
} from '../api/queries'

import type {
  DivisionLeaguesParams,
  LeagueTeamsParams,
  PlayoffOddsParams,
  LeadersParams,
  AdpParams,
  RecordParams,
} from '../api/config/urlBuilder'

export const useDivisionLeagues = (params: DivisionLeaguesParams) => {
  const config = getQueryConfig('leagues')
  return useQuery({
    queryKey: ['leagues', 'divisions', params],
    queryFn: () => fetchDivisionLeagues(params),
    ...config,
  })
}

export const useLeagueTeams = (params: LeagueTeamsParams) => {
  const config = getQueryConfig('teams')
  return useQuery({
    queryKey: ['teams', params.leagueId, params.year],
    queryFn: () => fetchLeagueTeams(params),
    ...config,
  })
}

export const useLeagueRanks = (year: number) => {
  const config = getQueryConfig('leagueRanks')
  return useQuery({
    queryKey: ['leagueRanks', year],
    queryFn: () => fetchLeagueRanks(year),
    ...config,
  })
}

export const usePlayoffOdds = (params: PlayoffOddsParams) => {
  const config = getQueryConfig('playoffOdds')
  return useQuery({
    queryKey: ['playoffOdds', params],
    queryFn: () => fetchPlayoffOdds(params),
    ...config,
  })
}

export const useCurrentTier = (year: number) => {
  const config = getQueryConfig('standings')
  return useQuery({
    queryKey: ['currentTier', year],
    queryFn: () => fetchCurrentTier(year),
    ...config,
  })
}

export const useLeaders = (params: LeadersParams) => {
  const config = getQueryConfig('leaderboards')
  return useQuery({
    queryKey: ['leaders', params],
    queryFn: () => fetchLeaders(params),
    ...config,
  })
}

export const useCurrentWeek = () => {
  const config = getQueryConfig('currentWeek')
  return useQuery({
    queryKey: ['currentWeek'],
    queryFn: fetchCurrentWeek,
    ...config,
  })
}

export const useCurrentYear = () => {
  const config = getQueryConfig('currentYear')
  return useQuery({
    queryKey: ['currentYear'],
    queryFn: fetchCurrentYear,
    ...config,
  })
}

export const useAdp = (params: AdpParams) => {
  const config = getQueryConfig('adp')
  return useQuery({
    queryKey: ['adp', params],
    queryFn: () => fetchAdp(params),
    ...config,
  })
}

export const useCareerRecords = (
  recordType: 'wins' | 'winPct' | 'pointsFor' | 'avgPointsFor' | 'coachRating',
  params?: RecordParams
) => {
  const config = getQueryConfig('records')
  return useQuery({
    queryKey: ['records', 'career', recordType, params],
    queryFn: () => fetchCareerRecords(recordType, params),
    ...config,
  })
}

export const useSeasonRecords = (
  recordType: 'wins' | 'winPct' | 'pointsFor' | 'coachRating',
  params?: RecordParams
) => {
  const config = getQueryConfig('records')
  return useQuery({
    queryKey: ['records', 'season', recordType, params],
    queryFn: () => fetchSeasonRecords(recordType, params),
    ...config,
  })
}
