export interface ApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

export interface ApiEndpoints {
  // League & Division Management
  divisionLeagues: string
  leagueTeams: string
  leagueRanks: string

  // Standings & Playoff Data
  playoffOdds: string
  currentTier: string

  // Leaderboard & Statistics
  leaders: string
  getWeek: string
  getYear: string

  // Draft & Player Data
  adp: string

  // Hall of Fame Records
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
    baseUrl: 'https://roldtimehockey.com/node',
    timeout: isDevelopment ? 10000 : 5000, // 10s in dev, 5s in prod
    retryAttempts: 3,
    retryDelay: 1000,
  }
}

export const API_ENDPOINTS: ApiEndpoints = {
  // League & Division Management
  divisionLeagues: '/divisionleagues',
  leagueTeams: '/leagueteams',
  leagueRanks: '/leagueranks',

  // Standings & Playoff Data
  playoffOdds: '/v2/standings/advanced/playoff_odds',
  currentTier: '/currenttier',

  // Leaderboard & Statistics
  leaders: '/leaders',
  getWeek: '/getweek',
  getYear: '/getyear',

  // Draft & Player Data
  adp: '/adp',

  // Hall of Fame Records
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
