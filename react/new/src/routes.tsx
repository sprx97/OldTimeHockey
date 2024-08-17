import AverageDraftPosition from './components/Pages/ADP'
import Community from './components/Pages/Community'
import HallOfFame from './components/Pages/HallOfFame'
import HomePage from './components/Pages/Home'
import Leaderboard from './components/Pages/Leaderboard'
import Standings from './components/Pages/Standings'
import TrophyRoom from './components/Pages/TrophyRoom'

const routes = [
  { path: '/', element: <HomePage />, name: 'Home' },
  { path: '/leaderboard', element: <Leaderboard />, name: 'Leaderboard' },
  {
    path: '/standings',
    element: <Standings />,
    name: 'Standings',
    anchors: [
      { path: '#leagueranks', name: 'League Ranks' },
      { path: '#d1', name: 'Division 1' },
      { path: '#d2', name: 'Division 2' },
      { path: '#d3', name: 'Division 3' },
      { path: '#d4', name: 'Division 4' },
    ],
  },
  { path: '/adp', element: <AverageDraftPosition />, name: 'ADP' },
  { path: '/halloffame', element: <HallOfFame />, name: 'Hall of Fame' },
  {
    path: '/trophyroom',
    element: <TrophyRoom />,
    name: 'Trophy Room',
    anchors: [
      { path: '#d1', name: 'Division 1 Champions' },
      { path: '#pointsfor', name: 'Points For Champions' },
      { path: '#woppacup', name: 'Woppa Cup Champions' },
    ],
  },
  { path: '/community', element: <Community />, name: 'Community' },
]

export default routes
