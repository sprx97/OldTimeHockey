import React from 'react';
import { Container, Grid, Header, Image, Segment, Tab } from 'semantic-ui-react';
import Banner from './Banner';

const panes = [
  {
    menuItem: '2024-2025',
    render: () => (
      <Tab.Pane>
        224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
          </li>
          <li>
            <b>Points For Champion: </b>
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
          </li>
          <u>Rule Changes</u>
          <p>None</p>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2023-2024',
    render: () => (
      <Tab.Pane>
        182 teams, 13 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12086/teams/62768?season=2023">GusZ</a>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12098/teams/63291?season=2023">costcostan</a> - 5404.45
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12086/teams/62752?season=2023">benzene96</a> - 99.44%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12093/teams/63316?season=2023">akacesfan</a>
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>Tenure policy added (see Promotion and Relegation section below)</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2022-2023',
    render: () => (
      <Tab.Pane>
        238 teams, 17 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12086/teams/62748?season=2022">SPRX97</a>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12092/teams/63347?season=2022">christhrowrocks</a> - 5446.5
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12089/teams/63214?season=2022">GusZ</a> - 99.36%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12092/teams/63347?season=2022">christhrowrocks</a>
          </li>
          <u>Rule Changes</u>
          <p>None</p>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2021-2022',
    render: () => (
      <Tab.Pane>
        196 teams, 14 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12086/teams/62850?season=2021">Noddan</a>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12088/teams/63153?season=2021">akacesfan</a> - 5547.2
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12087/teams/63169?season=2021">ovorc</a> - 99.29%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12091/teams/63276?season=2021">TwoPlanks</a>
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>Removed 3rd IR+ slot.</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2020-2021',
    render: () => (
      <Tab.Pane>
        224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12086/teams/62775?season=2020">benzene96</a>
          </li>
          <li>
            <b>Points For Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12096/teams/63385?season=2020">MWHazard</a> 3172.7
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12086/teams/62750?season=2020">Kovellen</a> - 99.32%
          </li>
          <li>
            <b>Woppa Cup Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12086/teams/62749?season=2020">Boboombang</a>
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
            <a href="https://www.fleaflicker.com/nhl/leagues/12091/teams/63199?season=2019">tooproforyou</a> - 5446.35
          </li>
          <li>
            <b>Coaches Rating Champion: </b>
            <a href="https://www.fleaflicker.com/nhl/leagues/12086/teams/62572?season=2019">ch1zzle</a> - 99.11%
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
      <Segment basic />
      <Container>
        <Segment basic>
          <Grid centered>
            <Grid.Row columns={1}>
              <Grid.Column textAlign="center">
                <Header as="h1">About</Header>
                OldTimeHockey is a fantasy hockey superleague run by redditors
                using <a href="http://www.fleaflicker.com/nhl">
                  Fleaflicker
                </a>{' '}
                featuring 238 teams sorted into 17 leagues across 4 divisions.
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
                Website Administator:{' '}
                <a href="http://www.reddit.com/u/SPRX97">SPRX97</a>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Header as="h1" textAlign="center">
            History
          </Header>
          <Tab
            defaultActiveIndex={0}
            panes={panes}
            menu={{
              vertical: true,
              tabular: false,
              style: { display: 'flex', justifyContent: 'center' },
            }}
          />
          <Header as="h1" textAlign="center">
            Scoring and Settings
          </Header>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Header as="h3" textAlign="center">Settings</Header>
                <ul>
                  <li>14-teams, H2H points.</li>
                  <li>Top-6 make playoffs.</li>
                  <li>7 free agent adds per week.</li>
                  <li>Season-long cross-league total points competition.</li>
                  <li>Season-long cross-league knockout tournament.</li>
                  <a href="http://www.fleaflicker.com/nhl/leagues/12086/rules">Full Rules</a>
                </ul>
              </Grid.Column>
              <Grid.Column>
                <Header as="h3" textAlign="center">Scoring</Header>
                <ul>
                  <li>Goal: 4</li>
                  <li>Assist: 2.5</li>
                  <li>PPP: 1</li>
                  <li>Hit: .4</li>
                  <li>Block: .4</li>
                  <li>SOG: .25</li>
                  <li>PIM: .2</li>
                  <li>Win: 3</li>
                  <li>Loss: -1.5</li>
                  <li>OT Loss: 1</li>
                  <li>Save: .25</li>
                  <li>GA: -1</li>
                  <a href="http://www.fleaflicker.com/nhl/leagues/12086/scoring">Full Scoring</a>
                </ul>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Header as="h1" textAlign="center">
            Promotion and Relegation
          </Header>
          <Grid>
            <Grid.Row columns={1}>
              <Grid.Column>
                <Image src={"/images/PromoRele.png"} />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
              <Grid.Column>
                <Header as="h2" textAlign="center">Tenure</Header>
                In order to prevent unfair advantages in D4 leagues, and encourage veterans to return, <b>Any manager who has (a) been in D1 or (b) made D2 playoffs since the 4-division format was introduced in 2016-17 is ineligible for D4 and will say in D3. This also applies to managers returning from a hiatus. The year threshold for this is subject to change in the future in order to maintain relevance.</b>
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
        <Segment basic />
      </Container>
    </div>
  );
};

export default Homepage;
