import ms from 'ms'

export interface QueryConfig {
  staleTime: number
  cacheTime: number
}

export interface QueryConfigs {
  [key: string]: QueryConfig
}

export const QUERY_CONFIGS: QueryConfigs = {
  leagues: {
    staleTime: ms('1d'),
    cacheTime: ms('7d'),
  },

  teams: {
    staleTime: ms('12h'),
    cacheTime: ms('2d'),
  },

  leagueRanks: {
    staleTime: ms('6h'),
    cacheTime: ms('1d'),
  },

  standings: {
    staleTime: ms('30m'),
    cacheTime: ms('2h'),
  },

  playoffOdds: {
    staleTime: ms('15m'),
    cacheTime: ms('1h'),
  },

  leaderboards: {
    staleTime: ms('1h'),
    cacheTime: ms('4h'),
  },

  currentWeek: {
    staleTime: ms('5m'),
    cacheTime: ms('15m'),
  },

  currentYear: {
    staleTime: ms('1d'),
    cacheTime: ms('7d'),
  },

  adp: {
    staleTime: ms('2h'),
    cacheTime: ms('8h'),
  },

  records: {
    staleTime: ms('7d'),
    cacheTime: ms('30d'),
  },

  default: {
    staleTime: ms('15m'),
    cacheTime: ms('1h'),
  },
}

export const getQueryConfig = (dataType: string): QueryConfig => {
  return QUERY_CONFIGS[dataType] || QUERY_CONFIGS.default
}
