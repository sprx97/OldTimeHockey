export interface ApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

export interface ApiEndpoints {
  divisionLeagues: string
  leagueTeams: string
  leagueRanks: string
  playoffOdds: string
  currentTier: string
  leaders: string
  getWeek: string
  getYear: string
  adp: string
  winsRecord: string
  winPctRecord: string
  pfRecord: string
  avgPfRecord: string
  coachRatingRecord: string
  seasonWinPctRecord: string
  seasonWinsRecord: string
  seasonPfRecord: string
  seasonCoachRatingRecord: string
}

const getApiConfig = (): ApiConfig => {
  // Use import.meta.env for Vite, fallback to 'production'
  const isDevelopment = import.meta.env?.MODE === 'development'

  return {
    baseUrl: isDevelopment
      ? `${window.location.protocol}//${window.location.host}/api`
      : 'https://roldtimehockey.com/node',
    timeout: isDevelopment ? 10000 : 5000, // 10s in dev, 5s in prod
    retryAttempts: 3,
    retryDelay: 1000,
  }
}

export const API_ENDPOINTS: ApiEndpoints = {
  divisionLeagues: '/divisionleagues',
  leagueTeams: '/leagueteams',
  leagueRanks: '/leagueranks',
  playoffOdds: '/v2/standings/advanced/playoff_odds',
  currentTier: '/currenttier',
  leaders: '/leaders',
  getWeek: '/getweek',
  getYear: '/getyear',
  adp: '/adp',
  winsRecord: '/winsrecord',
  winPctRecord: '/winpctrecord',
  pfRecord: '/pfrecord',
  avgPfRecord: '/avgpfrecord',
  coachRatingRecord: '/coachratingrecord',
  seasonWinPctRecord: '/seasonwinpctrecord',
  seasonWinsRecord: '/seasonwinsrecord',
  seasonPfRecord: '/seasonpfrecord',
  seasonCoachRatingRecord: '/seasoncoachratingrecord',
}

export const apiConfig = getApiConfig()
