import About from './components/Pages/About'
import HallOfFame from './components/Pages/HallOfFame'
import HomePage from './components/Pages/Home'
import Leaderboard from './components/Pages/Leaderboard'
import Standings from './components/Pages/Standings'
import TrophyRoom from './components/Pages/TrophyRoom'

const routes = [
  { path: '/', element: <HomePage />, name: 'Home' },
  { path: '/about', element: <About />, name: 'About' },
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
  { path: '/halloffame', element: <HallOfFame />, name: 'Hall of Fame' },
  {
    path: '/trophyroom',
    element: <TrophyRoom />,
    name: 'Trophy Room',
  },
]

export default routes
