/* eslint-disable */
import _ from 'lodash';
import React, { Component } from 'react';
import { Container, Segment, Dropdown, Header, Divider, Grid } from 'semantic-ui-react';
import LeagueRanksTable from './LeagueRanksTable';
import LeagueStandingsTable from './LeagueStandingsTable';

export default class Standings extends Component {
  state = {
    data: null,
    query: "2019",
    dropdownOptions: [
      {
        key: "2019",
        text: "2019-2020",
        value: "2019",
      },
      {
        key: "2018",
        text: "2018-2019",
        value: "2018",
      },
      {
        key: "2017",
        text: "2017-2018",
        value: "2017",
      },
      {
        key: "2016",
        text: "2016-2017",
        value: "2016",
      },
      {
        key: "2015",
        text: "2015-2016",
        value: "2015",
      },
      {
        key: "2014",
        text: "2014-2015",
        value: "2014",
      },
      {
        key: "2013",
        text: "2013-2014",
        value: "2013",
      },
      {
        key: "2012",
        text: "2012-2013",
        value: "2012",
      },      
    ],
  };

/*  getData = async () => {
    const res = await fetch("http://www.roldtimehockey.com/node/
  };*/

  onChange = (event, result) => {
    const {value} = result || event.target;
    this.setState({query: value});

    // GetData here -- list of divisions for a year... at least name and ID
  };

  render() {
    const {data, query, dropdownOptions} = this.state;

    return (
      <Container fluid>
        <Segment basic>
          <Grid>
            <Grid.Row columns={7}>
              <Grid.Column /><Grid.Column /><Grid.Column />
              <Grid.Column>
                <Dropdown
                  fluid
                  search
                  selection
                  options={dropdownOptions}
                  defaultValue={query}
                  wrapSelection={false}
                  onChange={this.onChange}
                />
              </Grid.Column>
              <Grid.Column /><Grid.Column /><Grid.Column />
            </Grid.Row>
          </Grid>
          <Header as="h1" textAlign="center" block>League Ranks</Header>
          <Grid centered>
            <Grid.Row columns={3}>
              <Grid.Column width={5}>
                <LeagueRanksTable year={query} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Divider hidden />
          <Header as="h1" textAlign="center" block>Division 1</Header>
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

          <Header as="h1" textAlign="center" block>Division 2</Header>





        </Segment>
      </Container>
    );
  }
}

/*const Standings = () => {
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
*/
