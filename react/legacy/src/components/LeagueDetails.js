import React from 'react';
import { Container, Header } from 'semantic-ui-react';

const LeagueDetails = (props) => {
  const leagueId = props.match.params.leagueId;
  return (
    <Container>
      <Header as="h1">League Details - {leagueId}</Header>
    </Container>
  );
};

export default LeagueDetails;
