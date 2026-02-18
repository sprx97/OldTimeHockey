import React from "react";
import { Container, Grid, Header, Image, Segment, Tab } from "semantic-ui-react";
import SiteHeader from "./SiteHeader";

const seasons = [
  {
    year: "2025-2026",
    teams: "TBD",
    leagues: "TBD",
    divisions: 5,
    champions: {
      division1: { name: "TBD", link: "#" },
      pointsFor: { name: "TBD", link: "#", stat: "TBD" },
      coachesRating: { name: "TBD", link: "#", stat: "TBD" },
      woppaCup: { name: "TBD", link: "#" },
    },
    ruleChanges: ["Moved to 5-division format and updated promo/rele and tenure to align with it"],
  },
  {
    year: "2024-2025",
    teams: 224,
    leagues: 16,
    divisions: 4,
    champions: {
      division1: { name: "GusZ", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62768&season=2024" },
      pointsFor: { name: "ch1zzle", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62749?season=2024", stat: 5070.5 },
      coachesRating: { name: "GusZ", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62768?season=2024", stat: "99.51%" },
      woppaCup: { name: "tooproforyou", link: "https://www.fleaflicker.com/nhl/leagues/12088/teams/63135?season=2024" },
    },
    ruleChanges: "None",
  },
  {
    year: "2023-2024",
    teams: 182,
    leagues: 13,
    divisions: 4,
    champions: {
      division1: { name: "GusZ", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62768?season=2023" },
      pointsFor: { name: "costcostan", link: "https://www.fleaflicker.com/nhl/leagues/12098/teams/63291?season=2023", stat: 5404.45 },
      coachesRating: { name: "benzene96", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62752?season=2023", stat: "99.44%" },
      woppaCup: { name: "akacesfan", link: "https://www.fleaflicker.com/nhl/leagues/12093/teams/63316?season=2023" },
    },
    ruleChanges: ["Tenure policy added (see Promotion and Relegation section below)"],
  },
  {
    year: "2022-2023",
    teams: 238,
    leagues: 17,
    divisions: 4,
    champions: {
      division1: { name: "SPRX97", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62748?season=2022" },
      pointsFor: { name: "christhrowrocks", link: "https://www.fleaflicker.com/nhl/leagues/12092/teams/63347?season=2022", stat: 5446.5 },
      coachesRating: { name: "GusZ", link: "https://www.fleaflicker.com/nhl/leagues/12089/teams/63214?season=2022", stat: "99.36%" },
      woppaCup: { name: "christhrowrocks", link: "https://www.fleaflicker.com/nhl/leagues/12092/teams/63347?season=2022" },
    },
    ruleChanges: "None",
  },
  {
    year: "2021-2022",
    teams: 196,
    leagues: 14,
    divisions: 4,
    champions: {
      division1: { name: "Noddan", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62850?season=2021" },
      pointsFor: { name: "akacesfan", link: "https://www.fleaflicker.com/nhl/leagues/12088/teams/63153?season=2021", stat: 5547.2 },
      coachesRating: { name: "ovorc", link: "https://www.fleaflicker.com/nhl/leagues/12087/teams/63169?season=2021", stat: "99.29%" },
      woppaCup: { name: "TwoPlanks", link: "https://www.fleaflicker.com/nhl/leagues/12091/teams/63276?season=2021" },
    },
    ruleChanges: ["Removed 3rd IR+ slot."],
  },
  {
    year: "2020-2021",
    teams: 224,
    leagues: 16,
    divisions: 4,
    champions: {
      division1: { name: "benzene96", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62775?season=2020" },
      pointsFor: { name: "MWHazard", link: "https://www.fleaflicker.com/nhl/leagues/12096/teams/63385?season=2020", stat: 3172.7 },
      coachesRating: { name: "Kovellen", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62750?season=2020", stat: "99.32%" },
      woppaCup: { name: "Boboombang", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62749?season=2020" },
    },
    ruleChanges: ["Added 3rd IR+ slot for this season only."],
  },
  {
    year: "2019-2020",
    teams: 224,
    leagues: 16,
    divisions: 4,
    champions: {
      division1: { name: "ch1zzle*", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62572?season=2019" },
      pointsFor: { name: "tooproforyou", link: "https://www.fleaflicker.com/nhl/leagues/12091/teams/63199?season=2019", stat: 5446.35 },
      coachesRating: { name: "ch1zzle", link: "https://www.fleaflicker.com/nhl/leagues/12086/teams/62572?season=2019", stat: "99.11%" },
      woppaCup: { name: "selcio44", link: "https://www.fleaflicker.com/nhl/leagues/12099/teams/63238?season=2019" },
    },
    ruleChanges: [
      "Standings tiebreakers now PF instead of H2H",
      "Trade deadline now at end of week 22 (will vary year-to-year)",
      "+/- completely eliminated",
      "OT Losses now worth 1 point",
      "Saves increased from .24 to .25",
      "Goalies now receive SHP and PPP like skaters",
      "Mid-season promotions when D3 and higher teams go inactive"
    ]
  },
  {
    year: "2018-2019",
    teams: 224,
    leagues: 16,
    divisions: 4,
    champions: {
      division1: { name: "ch1zzle", link: "https://www.fleaflicker.com/nhl/leagues/11371/teams/59124?season=2018" },
      pointsFor: { name: "russtyj", link: "https://www.fleaflicker.com/nhl/leagues/11372/teams/59258?season=2018", stat: 5477.09 },
      coachesRating: { name: "sickboy1965", link: "https://www.fleaflicker.com/nhl/leagues/11348/teams/59007?season=2018", stat: "98.86%" },
      woppaCup: { name: "yaheardwperd", link: "https://www.fleaflicker.com/nhl/leagues/11381/teams/59349?season=2018" }
    },
    ruleChanges: ["Removed position maximums"]
  },
  {
    year: "2017-2018",
    teams: 224,
    leagues: 16,
    divisions: 4,
    champions: {
      division1: { name: "SleepTalkerz", link: "https://www.fleaflicker.com/nhl/leagues/10030/teams/54417?season=2017" },
      pointsFor: { name: "SPRX97", link: "https://www.fleaflicker.com/nhl/leagues/10032/teams/54543?season=2017", stat: 5193.49 },
      coachesRating: { name: "LAGunsHockey", link: "https://www.fleaflicker.com/nhl/leagues/10032/teams/54491?season=2017", stat: "98.37%" },
      woppaCup: { name: "akacesfan", link: "https://www.fleaflicker.com/nhl/leagues/10036/teams/54435?season=2017" }
    },
    ruleChanges: ["+/- decreased from 1 to .25", "IR slots switched to IR+"]
  },
  {
    year: "2016-2017",
    teams: 224,
    leagues: 16,
    divisions: 4,
    champions: {
      division1: { name: "Noddan", link: "https://www.fleaflicker.com/nhl/leagues/9001/teams/48833?season=2016" },
      pointsFor: { name: "Coyle1096", link: "https://www.fleaflicker.com/nhl/leagues/9011/teams/49625?season=2016", stat: 5080.32 },
      coachesRating: { name: "Woppa", link: "https://www.fleaflicker.com/nhl/leagues/9001/teams/48839?season=2016", stat: "96.54%" },
      woppaCup: { name: "Boboombang", link: "https://www.fleaflicker.com/nhl/leagues/9013/teams/49894?season=2016" }
    },
    ruleChanges: "None"
  },
  {
    year: "2015-2016",
    teams: 224,
    leagues: 16,
    divisions: 3,
    champions: {
      division1: { name: "Woppa", link: "https://www.fleaflicker.com/nhl/leagues/7526/teams/41604?season=2015" },
      pointsFor: { name: "Woppa", link: "https://www.fleaflicker.com/nhl/leagues/7526/teams/41604?season=2015", stat: 4875.55 },
      coachesRating: { name: "racer4", link: "https://www.fleaflicker.com/nhl/leagues/7531/teams/41668?season=2015", stat: "97.58%" },
      woppaCup: { name: "SleepTalkerz", link: "https://www.fleaflicker.com/nhl/leagues/7529/teams/41316?season=2015" }
    },
    ruleChanges: [
      "Wins and losses decreased from 4 and -2 to 3 and -1.5.",
      "Shutouts decreased from 3 to 2.5.",
      "Saves increased from .2 to .24.",
      "Future relegation planned for 4 tiers instead of 3."
    ]
  },
  {
    year: "2014-2015",
    teams: 196,
    leagues: 14,
    divisions: 3,
    champions: {
      division1: { name: "Teratic", link: "https://www.fleaflicker.com/nhl/leagues/5709/teams/32448?season=2014" },
      pointsFor: { name: "InvisibleTaco", link: "https://www.fleaflicker.com/nhl/leagues/5710/teams/32638?season=2014", stat: 5184.9 },
      coachesRating: { name: "concini", link: "https://www.fleaflicker.com/nhl/leagues/5709/teams/32454?season=2014", stat: "96.11%" },
      woppaCup: { name: "hkyplyr", link: "https://www.fleaflicker.com/nhl/leagues/5711/teams/32595?season=2014" }
    },
    ruleChanges: [
      "D2/D3 leagues increased from 12 to 14 teams.",
      "Wins and losses decreased from 6 and -3 to 4 and -2.",
      "Saves decreased from .3 to .2 per.",
      "Assists increased from 2 to 2.5 per.",
      "PIMs increased from .1 to .2 per."
    ]
  },
  {
    year: "2013-2014",
    teams: 134,
    leagues: 11,
    divisions: 3,
    champions: {
      division1: { name: "concini", link: "https://www.fleaflicker.com/nhl/leagues/4633/teams/26883?season=2013" },
      pointsFor: { name: "Teratic", link: "https://www.fleaflicker.com/nhl/leagues/4634/teams/26815?season=2013", stat: 4907.85 },
      coachesRating: { name: "Teratic", link: "https://www.fleaflicker.com/nhl/leagues/4634/teams/26815?season=2013", stat: "96.73%" },
      woppaCup: { name: "FCBcn19", link: "https://www.fleaflicker.com/nhl/leagues/4641/teams/26622?season=2013" }
    },
    ruleChanges: "None"
  },
  {
    year: "2012-2013",
    teams: 108,
    leagues: 10,
    divisions: 1,
    notes: "*Lockout-shortened season",
    champions: {
      division1: { name: "N/A" },
      pointsFor: { name: "Woppa", link: "https://www.fleaflicker.com/nhl/leagues/3801/teams/21590?season=2012", stat: 2552.7 },
      coachesRating: { name: "IAmAChemicalEngineer", link: "https://www.fleaflicker.com/nhl/leagues/3798/teams/21659?season=2012", stat: "96.15%" },
      woppaCup: { name: "Cannon49", link: "https://www.fleaflicker.com/nhl/leagues/3800/teams/21501?season=2012" }
    },
  }
];

const panes = seasons.map(({ year, teams, leagues, divisions, champions, ruleChanges }) => ({
  menuItem: year,
  render: () => (
    <Tab.Pane>
      {teams} teams, {leagues} leagues, {divisions} divisions
      <ul>
        <li>
          <b>Division 1 Champion: </b>
          {champions.division1 && champions.division1.link ?
              (<a href={champions.division1.link}>{champions.division1.name}</a>) :
              champions.division1 ? champions.division1.name : ''}
        </li>
        <li>
          <b>Points For Champion: </b>
          {champions.pointsFor && (
            <><a href={champions.pointsFor.link}>{champions.pointsFor.name}</a> - {champions.pointsFor.stat}</>
          )}
        </li>
        <li>
          <b>Coaches Rating Champion: </b>
          {champions.coachesRating && (
            <><a href={champions.coachesRating.link}>{champions.coachesRating.name}</a> - {champions.coachesRating.stat}</>
          )}
        </li>
        <li>
          <b>Woppa Cup Champion: </b>
          {champions.woppaCup && (
            <a href={champions.woppaCup.link}>{champions.woppaCup.name}</a>
          )}
        </li>
        {ruleChanges && (<u>Rule Changes</u>)}
        {Array.isArray(ruleChanges) ? (
          <ul>
            {ruleChanges.map((change, index) => (
              <li key={index}>{change}</li>
            ))}
          </ul>
        ) : (
          <p>{ruleChanges}</p>
        )}
      </ul>
    </Tab.Pane>
  ),
}));

const Homepage = () => {
  return (
    <div>
      <SiteHeader />
      <Segment basic />
      <Container>
        <Segment basic>
          <Grid centered>
            <Grid.Row columns={1}>
              <Grid.Column textAlign="center">
                <Header as="h1">About</Header>
                OldTimeHockey is a fantasy hockey superleague run
                using <a href="http://www.fleaflicker.com/nhl">
                  Fleaflicker
                </a>{" "}
                featuring 224 teams sorted into 16 leagues across 5 divisions.
                English Premier League style relegation dictates movement
                between divisions each season.
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={2}>
              <Grid.Column textAlign="center">
                <Header as="h1">Rules</Header>
                <Header as="h3">
                  <s>OTH Constitution</s> Under construction
                </Header>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <Header as="h1">Contacts</Header>
                League Founder:{" "}
                <a href="http://www.reddit.com/u/NextLevelFantasy">
                  NextLevelFantasy
                </a>
                <br />
                League Commissioners:{" "}
                <a href="http://www.reddit.com/u/sprx97">SPRX97</a>,{" "}
                <a href="http://www.reddit.com/u/TwoPlanksPrevail">Planks</a>
                <br />
                Website Administator:{" "}
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
              style: { display: "flex", justifyContent: "center" },
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
                  <li>Shutout: 2.5</li>
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
            <Grid.Row columns={3}>
              <Grid.Column>
                <Header as="h2" textAlign="center">D1 (14)</Header>
                <ul>
                  <li>(6) D1 Playoff teams</li>
                  <li>(1) D1 7th Place Bracket Winner</li>
                  <li>(4) D2 Finalist</li>
                  <li>(2) D2 3rd Place Winners</li>
                  <li>(1) PF Champion</li>
                  *Spotfills from top PF D1-2 Teams
                </ul>
              </Grid.Column>
              <Grid.Column>
                <Header as="h2" textAlign="center">D2 (28)</Header>
                <ul>
                  <li>(7) D1 8th-14th</li>
                  <li>(6) D2 4th-6th</li>
                  <li>(2) D2 7th Place Bracket Winners</li>
                  <li>(6) D3 Finalists</li>
                  <li>(3) D3 3rd Place Winners</li>
                  <li>(1) WoppaCup Champion</li>
                  <li>(1) Top PF D4 team</li>
                  *Spotfills from top PF D2-3 Teams
                </ul>
              </Grid.Column>
              <Grid.Column>
                <Header as="h2" textAlign="center">D3 (42)</Header>
                <ul>
                  <li>(14) D2 8th-14th</li>
                  <li>(9) D3 4th-6th</li>
                  <li>(3) D3 7th Place Bracket Winners</li>
                  <li>(8) D4 Finalists</li>
                  <li>(4) D4 3rd Place Winners</li>
                  <li>(1) WC Runner-up</li>
                  <li>(1) Top-PF D5 team</li>
                  *Spotfills from top PF D3-4 Teams
                </ul>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={3}>
              <Grid.Column>
                <Header as="h2" textAlign="center">D4 (56)</Header>
                <ul>
                  <li>(21) D3 8th-14th</li>
                  <li>(12) D4 4th-6th</li>
                  <li>(4) D4 7th Place Bracket Winners</li>
                  <li>(10+) D5 Finalists</li>
                  <li>(5+) D5 3rd Place Winners</li>
                  <li>New Signups (Tenured)</li>
                  *Spotfills from top PF D4-5 Teams
                </ul>
              </Grid.Column>
              <Grid.Column>
                <Header as="h2" textAlign="center">D5 (70+)</Header>
                <ul>
                  <li>(28) D4 8th-14th</li>
                  <li>(55+) D5 4th-14th</li>
                  <li>New Signups</li>
                </ul>
              </Grid.Column>
              <Grid.Column>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
              <Grid.Column>
                <Header as="h2" textAlign="center">Tenure</Header>
                In order to prevent unfair advantages in D5 leagues, and encourage veterans to return, <b>Any manager who has (a) been in D1 or (b) made D2 playoffs the 2020-2021 season is ineligible for D5 and will be placed into D4. This also includes managers returning from a hiatus. The year threshold for this is subject to change in the future.</b>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          {/* <Header as="h1" textAlign="center">
            Inactivity Policy and Midseason "Promotion"
          </Header>
          Users who go inactive in any division (stop setting lineups before playoffs) forfeit their slot no matter where they finish and are bumped to D5.
          Users who are inactive longer than two weeks in the season are subject to replacement off of the waitlist (D5) or via midseason promotion (D1-D4).
          If a D1-D4 team goes inactive, the current highest season-long PF team in the division below will be offered the team. This manager is now responsible for BOTH of their teams,
          and the higher one will be revoked of the lower one goes inactive. For the sake of promotion/relegation next season, they receive the higher slot of the two those teams earn. */}
        </Segment>
        <Segment basic />
      </Container>
    </div>
  );
};

export default Homepage;
