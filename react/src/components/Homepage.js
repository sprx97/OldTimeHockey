/* eslint-disable */
import React from 'react';
import { Container, Segment, Tab, Header, Grid } from 'semantic-ui-react';
import Banner from './Banner';

const panes = [
  {
    menuItem: '2020-2021',
    render: () => (
      <Tab.Pane>
        224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href=""></a>
            <br/>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href=""></a>
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href=""></a>
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href=""></a>
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>Added 3rd IR+ slot for this season only.</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2019-2020',
    render: () => (
      <Tab.Pane>
        224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12086/teams/62572?season=2019">ch1zzle*</a>
            <br/><i>* regular season winner, no playoffs due to Covid-19</i>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12091/teams/63199?season=2019">tooproforyou</a>
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12086/teams/62572?season=2019">ch1zzle</a>
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12099/teams/63238?season=2019">selcio44</a>
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>Standings tiebreakers now PF instead of H2H</li>
            <li>
              Trade deadline now at end of week 22 (will vary year-to-year)
            </li>
            <li>+/- completely eliminated</li>
            <li>OT Losses now worth 1 point</li>
            <li>Saves increased from .24 to .25</li>
            <li>Goalies now receive SHP and PPP like skaters</li>
            <li>Mid-season promotions when D3 and higher teams go inactive</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2018-2019',
    render: () => (
      <Tab.Pane>
        224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/11371/teams/59124?season=2018">ch1zzle</a>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/11372/teams/59258?season=2018">russtyj</a> - 5477.09
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/11348/teams/59007?season=2018">sickboy1965</a> - 98.86%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/11381/teams/59349?season=2018">yaheardwperd</a>
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>Removed position maximums</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2017-2018',
    render: () => (
      <Tab.Pane>
        224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/10030/teams/54417?season=2017">SleepTalkerz</a>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/10032/teams/54543?season=2017">SPRX97</a> - 5193.49
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/10032/teams/54491?season=2017">LAGunsHockey</a> - 98.37%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/10036/teams/54435?season=2017">akacesfan</a>
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>+/- decreased from 1 to .25</li>
            <li>IR slots switched to IR+</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2016-2017',
    render: () => (
      <Tab.Pane>
        224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/9001/teams/48833?season=2016">Noddan</a>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/9011/teams/49625?season=2016">Coyle1096</a> - 5080.32
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/9001/teams/48839?season=2016">Woppa</a> - 96.54%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/9013/teams/49894?season=2016">Boboombang</a>
          </li>
          <u>Rule Changes</u>
          <p>None</p>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2015-2016',
    render: () => (
      <Tab.Pane>
        224 teams, 16 leagues, 3 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/7526/teams/41604?season=2015">Woppa</a>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/7526/teams/41604?season=2015">Woppa</a> - 4875.55
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/7531/teams/41668?season=2015">racer4</a> - 97.58%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/7529/teams/41316?season=2015">SleepTalkerz</a>
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>Wins and losses decreased from 4 and -2 to 3 and -1.5.</li>
            <li>Shutouts decreased from 3 to 2.5.</li>
            <li>Saves increased from .2 to .24.</li>
            <li>Future relegation planned for 4 tiers instead of 3.</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2014-2015',
    render: () => (
      <Tab.Pane>
        196 teams, 14 leagues, 3 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/5709/teams/32448?season=2014">Teratic</a>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/5710/teams/32638?season=2014">InvisibleTaco</a> - 5184.9
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/5709/teams/32454?season=2014">concini</a> - 96.11%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/5711/teams/32595?season=2014">hkyplyr</a>
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>D2/D3 leagues increased from 12 to 14 teams.</li>
            <li>Wins and losses decreased from 6 and -3 to 4 and -2.</li>
            <li>Saved decreased from .3 to .2 per.</li>
            <li>Assists increased from 2 to 2.5 per.</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2013-2014',
    render: () => (
      <Tab.Pane>
        134 teams, 11 leagues, 3 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/4633/teams/26883?season=2013">concini</a>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/4634/teams/26815?season=2013">Teratic</a> - 4907.85
          </li>
          <li>
            <b>Coaches Rating Chapmion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/4634/teams/26815?season=2013">Teratic</a> - 96.73%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/4641/teams/26622?season=2013">FCBcn19</a>
          </li>
          <u>Rule Changes</u>
          <p>None</p>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2012-2013',
    render: () => (
      <Tab.Pane>
        <i>*lockout-shortened season</i><br/>
	108 teams, 10 leagues, 1 division.
        <ul>
          <li>
            <b>Division 1 Champion: </b>N/A
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/3801/teams/21590?season=2012">Woppa</a> - 2552.7
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/3798/teams/21659?season=2012">IAmAChemicalEngineer</a> - 96.15%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/3800/teams/21501?season=2012">Cannon49</a>
          </li>
        </ul>
      </Tab.Pane>
    ),
  },
];

const Homepage = () => {
  return (
    <div>
      <Banner />
      <Container>
        <Segment basic>
          <Grid centered>
            <Grid.Row columns={1}>
              <Grid.Column textAlign="center">
                <Header as="h1">About</Header>
                OldTimeHockey is a fantasy hockey super league run by redditors
                using <a href="http://www.fleaflicker.com/nhl">
                  Fleaflicker
                </a>{' '}
                featuring 224 teams sorted into 16 leagues across 4 divisions.
                English Premier League style relegation dictates movement
                between divisions each season.
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={2}>
              <Grid.Column textAlign="center">
                <Header as="h1">Rules</Header>
                <Header as="h3">
                  <a href="https://www.reddit.com/r/OldTimeHockey/wiki/index#wiki_oth_constitution">
                    OTH Constitution
                  </a>
                </Header>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <Header as="h1">Contacts</Header>
                League Founder:{' '}
                <a href="http://www.reddit.com/u/NextLevelFantasy">
                  NextLevelFantasy
                </a>
                <br />
                League Commissioners:{' '}
                <a href="http://www.reddit.com/u/sprx97">SPRX97</a>,{' '}
                <a href="http://www.reddit.com/u/TwoPlanksPrevail">Planks</a>
                <br />
                Website Administators:{' '}
                <a href="http://www.reddit.com/u/SPRX97">SPRX97</a>,{' '}
                <a href="http://www.reddit.com/u/phillycheeeeez">phillycheeeeez</a>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Header as="h1" textAlign="center">
            History
          </Header>
          <Tab
            panes={panes}
            menu={{
              vertical: true,
              tabular: false,
              style: { display: 'flex', justifyContent: 'center' },
            }}
          />
          <Header as="h1" textAlign="center">
            Promotion and Relegation
          </Header>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Header as="h3" textAlign="center">D1</Header>
                <ul>
                  <li>(6) D1 ranks 1-6 (all playoff teams)</li>
                  <li>(6) D2 ranks 1-2 (all finalists)</li>
                  <li>(1) PF Champion</li>
                  <li>(1) Woppa Cup Champion</li>
                  <li><i>Extra slots filled from highest regular season PF out of D1 and D2 teams</i></li>
                </ul>
              </Grid.Column>
              <Grid.Column>
                <Header as="h3" textAlign="center">D2</Header>
                <ul> 
                  <li>(6)  D1 ranks 7-12</li>
                  <li>(12) D2 ranks 3-6</li>
                  <li>(20) D3 ranks 1-4 (semifinalists)</li>
                  <li>(3)  D4 top-3 PF teams</li>
                  <li>(1)  Woppa Cup Runner Up</li>
                  <li><i>Extra slots filled from highest regular season PF out of D2 and D3 teams</i></li>
                </ul>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Header as="h3" textAlign="center">D3</Header>
                <ul>
                  <li>(2)  D1 ranks 13-14</li>
                  <li>(24) D2 ranks 7-14</li>
                  <li>(15) D3 ranks 5-7 (regular season)</li>
                  <li>(28) D4 ranks 1-4 (semifinalists)</li>
                  <li><i>Extra spots filled from highest PF out of D3 and D4 teams</i></li>
                </ul>
              </Grid.Column>
              <Grid.Column>
                <Header as="h3" textAlign="center">D4</Header>
                <ul>
                  <li>All returning D3 teams</li>
                  <li>All returning D4 teams</li>
                  <li>Newcomers</li>
                </ul>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Header as="h1" textAlign="center">
            Inactivity Policy and Midseason "Promotion"
          </Header>
          Users who go inactive in any division (stop setting lineups before playoffs) forfeit their slot no matter where they finish and are bumped to D4.
          Users who are inactive longer than two weeks in the season are subject to replacement off of the waitlist (D4) or via midseason promotion (D1-D3).
          If a D1-D3 team goes inactive, the current highest season-long PF team in the division below will be offered the team. This manager is now responsible for BOTH of their teams,
          and the higher one will be revoked of the lower one goes inactive. For the sake of promotion/relegation next season, they receive the higher slot of the two those teams earn.
        </Segment>
      </Container>
    </div>
  );
};

export default Homepage;
