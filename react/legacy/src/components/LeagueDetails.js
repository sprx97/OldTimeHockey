import React, { useState, useEffect } from 'react';
import { Container, Header, Button } from 'semantic-ui-react';

const LeagueDetails = (props) => {
  const leagueId = props.match.params.leagueId;
  const [playoffOdds, setPlayoffOdds] = useState(null);

  useEffect(() => {
    const fetchPlayoffOdds = async () => {
    try {
      const response = await fetch(`https://roldtimehockey.com/node/v2/standings/advanced/playoff_odds?league=${leagueId}`);
      const data = await response.json();
      setPlayoffOdds(data);
    } catch (error) {
      console.error('Error fetching playoff odds:', error);
    }
    };
    
    fetchPlayoffOdds();
  }, [leagueId]);

  return (
    <Container>
      <Header as="h1">League Details - {leagueId}</Header>
      {playoffOdds && (
        <pre style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(playoffOdds, null, 2)}
        </pre>
      )}
    </Container>
  );
};

export default LeagueDetails;
