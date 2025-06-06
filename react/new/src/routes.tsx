import About from './components/Pages/About'
import HomePage from './components/Pages/Home'
import Leaderboard from './components/Pages/Leaderboard'
import Rules from './components/Pages/Rules'
import Standings from './components/Pages/Standings'
import TrophyRoom from './components/Pages/TrophyRoom'

const routes = [
  { path: '/', element: <HomePage />, name: 'Home' },
  { path: '/about', element: <About />, name: 'About' },
  { path: '/rules', element: <Rules />, name: 'Rules' },
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
  {
    path: '/trophyroom',
    element: <TrophyRoom />,
    name: 'Awards',
  },
]

export default routes
