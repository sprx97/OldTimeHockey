/* eslint-disable */
import React from 'react';
import { Container, Segment, Tab } from 'semantic-ui-react';
import Header from './Header';

const panes = [
  {
    menuItem: '2019',
    render: () => (
      <Tab.Pane>
        2019-2020: 224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion:</b>
          </li>
          <li>
            <b>Points For Champion:</b>
          </li>
          <li>
            <b>Coaches Rating Champion:</b>
          </li>
          <li>
            <b>Woppa Cup Champion:</b>
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>Standings tiebreakers now PF instead of H2H</li>
            <li>
              Trade deadline now at end of week 22 (will vary year-to-year)
            </li>
            <li>+/- completely eliminated</li>
            <li>OT Losses now worth 1 point</li>
            <li>Saves switched from .24 to .25</li>
            <li>Goalies now receive SHP and PPP like skaters</li>
            <li>Mid-season promotions when D3 and higher teams go inactive</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2018',
    render: () => (
      <Tab.Pane>
        2018-2019: 224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion:</b> ch1zzle
          </li>
          <li>
            <b>Points For Champion:</b> russtyj - 5477.09
          </li>
          <li>
            <b>Coaches Rating Champion:</b> sickboy1965 - 98.86%
          </li>
          <li>
            <b>Woppa Cup Champion:</b> yaheardwperd
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
    menuItem: '2017',
    render: () => (
      <Tab.Pane>
        2017-2018: 224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion:</b> SleepTalkerz
          </li>
          <li>
            <b>Points For Champion:</b> SPRX97 - 5193.49
          </li>
          <li>
            <b>Coaches Rating Champion:</b> LAGunsHockey - 98.37%
          </li>
          <li>
            <b>Woppa Cup Champion:</b> akacesfan
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>+/- switched from 1 to .25</li>
            <li>IR slots switched to IR+</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2016',
    render: () => (
      <Tab.Pane>
        2016-2017: 224 teams, 16 leagues, 4 divisions
        <ul>
          <li>
            <b>Division 1 Champion:</b> Noddan
          </li>
          <li>
            <b>Points For Champion:</b> Coyle1096 - 5080.32
          </li>
          <li>
            <b>Coaches Rating Champion:</b> Woppa1 - 96.54%
          </li>
          <li>
            <b>Woppa Cup Champion:</b> Boboombang
          </li>
          <u>Rule Changes</u>
          <p>None</p>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2015',
    render: () => (
      <Tab.Pane>
        2015-2016: 224 teams, 16 leagues, 3 divisions
        <ul>
          <li>
            <b>Division 1 Champion:</b> Woppa1
          </li>
          <li>
            <b>Points For Champion:</b> Woppa1 - 4875.55
          </li>
          <li>
            <b>Coaches Rating Champion:</b> racer4 - 97.58%
          </li>
          <li>
            <b>Woppa Cup Champion:</b> SleepTalkerz
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>Wins and losses switched from 4 and -2 to 3 and -1.5.</li>
            <li>Shutouts switched from 3 to 2.5.</li>
            <li>Saves switched from .2 to .24.</li>
            <li>Future relegation planned for 4 tiers instead of 3.</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2014',
    render: () => (
      <Tab.Pane>
        2014-2015: 196 teams, 14 leagues, 3 divisions
        <ul>
          <li>
            <b>Division 1 Champion:</b> Teratic
          </li>
          <li>
            <b>Points For Champion:</b> InvisibleTaco - 5184.9
          </li>
          <li>
            <b>Coaches Rating Champion:</b> concini - 96.11%
          </li>
          <li>
            <b>Woppa Cup Champion:</b> hkyplyr
          </li>
          <u>Rule Changes</u>
          <ul>
            <li>D2/D3 leagues upped from 12 to 14 teams.</li>
            <li>Wins and losses switched from 6 and -3 to 4 and -2.</li>
            <li>Saved decreased from .3 to .2 per.</li>
            <li>Assists increased from 2 to 2.5 per.</li>
          </ul>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2013',
    render: () => (
      <Tab.Pane>
        2013-2014: 134 teams, 11 leagues, 3 divisions
        <ul>
          <li>
            <b>Division 1 Champion:</b> concini
          </li>
          <li>
            <b>Points For Champion:</b> Teratic - 4907.85
          </li>
          <li>
            <b>Coaches Rating Chapmion:</b> Teratic - 96.73%
          </li>
          <li>
            <b>Woppa Cup Champion:</b> FCBcn19
          </li>
          <u>Rule Changes</u>
          <p>None</p>
        </ul>
      </Tab.Pane>
    ),
  },
  {
    menuItem: '2012',
    render: () => (
      <Tab.Pane>
        2012-2013 (lockout-shortened season): 108 teams, 10 leagues, 1 division.
        <ul>
          <li>
            <b>Division 1 Champion:</b> N/A
          </li>
          <li>
            <b>Points For Champion:</b> Woppa1 - 2552.7
          </li>
          <li>
            <b>Coaches Rating Chapmion:</b> IAmAChemicalEngineer - 96.15%
          </li>
          <li>
            <b>Woppa Cup Champion:</b> Cannon49
          </li>
        </ul>
      </Tab.Pane>
    ),
  },
];

const Homepage = () => {
  return (
    <div>
      <Header />
      <Container>
        <Segment basic textAlign="left">
          <div>
            <h1>About</h1>
            <p>
              OldTimeHockey is a fantasy hockey "super league" run by redditors
              using <a href="http://www.fleaflicker.com/nhl">fleaflicker</a>,
              featuring 224 teams sorted into 16 leagues across 4 divisions.
              English Premier League style relegation dictates movement between
              divisions each season.
            </p>
            <h1>Rules</h1>
            <h3>
              <a href="https://www.reddit.com/r/OldTimeHockey/wiki/index#wiki_oth_constitution">
                OTH Constitution
              </a>
            </h3>
            <h1>History</h1>
            <Tab panes={panes} />
            <h1>Contacts</h1>
            <p>
              League Commissioner:{' '}
              <a href="http://www.reddit.com/u/NextLevelFantasy">
                NextLevelFantasy
              </a>
              <br />
              Website Administator:{' '}
              <a href="http://www.reddit.com/u/SPRX97">SPRX97</a>
            </p>
            <br />
          </div>
        </Segment>
      </Container>
    </div>
  );
};

export default Homepage;
