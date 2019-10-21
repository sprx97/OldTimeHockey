/* eslint-disable */
import _ from 'lodash';
import React from 'react';
import { Container, Segment, Header, Divider, Grid } from 'semantic-ui-react';
import LeagueRanksTable from './LeagueRanksTable';
import LeagueStandingsTable from './LeagueStandingsTable';

const Standings = () => {
  return (
    <Container fluid>
      <Segment basic>
        <Header as="h1" textAlign="center" block>
          League Ranks
        </Header>
        <Grid centered>
          <Grid.Row columns={3}>
            <Grid.Column width={5}>
              <LeagueRanksTable year="2019" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider hidden />
        <Header as="h1" textAlign="center" block>
          Division 1
        </Header>
        <Grid centered>
          <Grid.Row columns={3}>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Gretzky"
                leagueID="12086"
                imgSrc="/images/jerseys/Gretzky.png"
                promotion={true}
                relegation={true}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider hidden />
        <Header as="h1" textAlign="center" block>
          Division 2
        </Header>
        <Grid centered>
          <Grid.Row columns={3}>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Jones-Allen"
                leagueID="12087"
                imgSrc="/images/jerseys/Jones-Allen.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Roy"
                leagueID="12088"
                imgSrc="/images/jerseys/Roy.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Hasek"
                leagueID="12089"
                imgSrc="/images/jerseys/Hasek.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Header as="h1" textAlign="center" block>
          Division 3
        </Header>
        <Grid centered>
          <Grid.Row columns={3}>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Yzerman"
                leagueID="12090"
                imgSrc="/images/jerseys/Hasek.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Jagr"
                leagueID="12091"
                imgSrc="/images/jerseys/Jagr.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Lemieux"
                leagueID="12092"
                imgSrc="/images/jerseys/Lemieux.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Dionne"
                leagueID="12093"
                imgSrc="/images/jerseys/Dionne.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Howe"
                leagueID="12094"
                imgSrc="/images/jerseys/Howe.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Header as="h1" textAlign="center" block>
          Division 4
        </Header>
        <Grid centered>
          <Grid.Row columns={3}>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Borque"
                leagueID="12095"
                imgSrc="/images/jerseys/Borque.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Orr"
                leagueID="12096"
                imgSrc="/images/jerseys/Orr.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Lidstrom"
                leagueID="12097"
                imgSrc="/images/jerseys/Lidstrom.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Niedermayer"
                leagueID="12098"
                imgSrc="/images/jerseys/Niedermayer.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Leetch"
                leagueID="12099"
                imgSrc="/images/jerseys/Leetch.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Chelios"
                leagueID="12100"
                imgSrc="/images/jerseys/Chelios.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              <LeagueStandingsTable
                leagueName="Pronger"
                leagueID="12101"
                imgSrc="/images/jerseys/Pronger.png"
                promotion={true}
                relegation={false}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default Standings;
