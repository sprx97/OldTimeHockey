import About from '@components/Pages/About'
import HomePage from '@components/Pages/Home'
import Leaderboard from '@components/Pages/Leaderboard'
import Rules from '@components/Pages/Rules'
import Standings from '@components/Pages/Standings'
import TrophyRoom from '@components/Pages/TrophyRoom'
import RouteErrorBoundary from '@components/ErrorBoundary/RouteErrorBoundary'

const routes = [
  {
    path: '/',
    element: (
      <RouteErrorBoundary routeName='Home'>
        <HomePage />
      </RouteErrorBoundary>
    ),
    name: 'Home',
  },
  {
    path: '/about',
    element: (
      <RouteErrorBoundary routeName='About'>
        <About />
      </RouteErrorBoundary>
    ),
    name: 'About',
  },
  {
    path: '/rules',
    element: (
      <RouteErrorBoundary routeName='Rules'>
        <Rules />
      </RouteErrorBoundary>
    ),
    name: 'Rules',
  },
  {
    path: '/leaderboard',
    element: (
      <RouteErrorBoundary routeName='Leaderboard'>
        <Leaderboard />
      </RouteErrorBoundary>
    ),
    name: 'Leaderboard',
  },
  {
    path: '/standings',
    element: (
      <RouteErrorBoundary routeName='Standings'>
        <Standings />
      </RouteErrorBoundary>
    ),
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
    element: (
      <RouteErrorBoundary routeName='Awards'>
        <TrophyRoom />
      </RouteErrorBoundary>
    ),
    name: 'Awards',
  },
]

export default routes
