import { useDivisionLeagues, useCurrentYear } from '../../../services'

function Standings() {
  const { data: currentYear, isLoading: yearLoading } = useCurrentYear()
  const {
    data: leagues,
    isLoading: leaguesLoading,
    error,
  } = useDivisionLeagues({
    year: currentYear?.currentYear || 2024,
  })

  if (yearLoading || leaguesLoading) {
    return <div>Loading API data...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>API Test - Standings Page</h1>
      <h2>Current Year Data:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(currentYear, null, 2)}
      </pre>

      <h2>Division Leagues Data:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(leagues, null, 2)}
      </pre>
    </div>
  )
}

export default Standings
