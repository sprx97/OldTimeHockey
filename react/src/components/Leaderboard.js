/* eslint-disable */
import _ from 'lodash';
import React, { Component } from 'react';
import { Container, Segment, Table } from 'semantic-ui-react';

const tableData = [
  {
    leagueID: 12086,
    teamID: 62750,
    leaguename: 'Gretzky',
    teamname: 'Noddan HC',
    FFname: 'noddan',
    Wins: 2,
    Losses: 0,
    pointsFor: 442,
    pointsAgainst: 329.4,
    coachRating: 97.6,
    isChamp: 0,
    tier: 1,
  },
  {
    leagueID: 12087,
    teamID: 63149,
    leaguename: 'Jones-Allen',
    teamname: 'Eat your Cale, kids',
    FFname: 'bruinhawks',
    Wins: 2,
    Losses: 0,
    pointsFor: 429.55,
    pointsAgainst: 305.15,
    coachRating: 95.87,
    isChamp: 0,
    tier: 2,
  },
  {
    leagueID: 12086,
    teamID: 62751,
    leaguename: 'Gretzky',
    teamname: 'https://streamable.com/73ksy',
    FFname: 'VoodooSteve',
    Wins: 2,
    Losses: 0,
    pointsFor: 424.25,
    pointsAgainst: 360.3,
    coachRating: 97.04,
    isChamp: 0,
    tier: 1,
  },
  {
    leagueID: 12099,
    teamID: 63243,
    leaguename: 'Leetch',
    teamname: "Kb85's Team",
    FFname: 'Kb85',
    Wins: 2,
    Losses: 0,
    pointsFor: 418.85,
    pointsAgainst: 193.8,
    coachRating: 95.42,
    isChamp: 0,
    tier: 4,
  },
  {
    leagueID: 12093,
    teamID: 63182,
    leaguename: 'Dionne',
    teamname: 'Drunk Ovi',
    FFname: 'hotoatmeal',
    Wins: 1,
    Losses: 1,
    pointsFor: 414.5,
    pointsAgainst: 340,
    coachRating: 98.08,
    isChamp: 0,
    tier: 3,
  },
  {
    leagueID: 12087,
    teamID: 63147,
    leaguename: 'Jones-Allen',
    teamname: 'Hintz Me Baby One More Time',
    FFname: 'dkpatrick',
    Wins: 2,
    Losses: 0,
    pointsFor: 410.25,
    pointsAgainst: 336.75,
    coachRating: 98.97,
    isChamp: 0,
    tier: 2,
  },
  {
    leagueID: 12087,
    teamID: 63140,
    leaguename: 'Jones-Allen',
    teamname: 'Raging Joner',
    FFname: 'onegaishimasu',
    Wins: 1,
    Losses: 1,
    pointsFor: 409.3,
    pointsAgainst: 403.55,
    coachRating: 94.22,
    isChamp: 0,
    tier: 2,
  },
  {
    leagueID: 12089,
    teamID: 63214,
    leaguename: 'Hasek',
    teamname: 'Wrath of Joe McGrath',
    FFname: 'LAGunsHockey',
    Wins: 1,
    Losses: 1,
    pointsFor: 407.3,
    pointsAgainst: 385.5,
    coachRating: 98.18,
    isChamp: 0,
    tier: 2,
  },
  {
    leagueID: 12092,
    teamID: 63208,
    leaguename: 'Lemieux',
    teamname: 'BlizzNasty',
    FFname: 'ckroyal92',
    Wins: 2,
    Losses: 0,
    pointsFor: 407,
    pointsAgainst: 328.15,
    coachRating: 96.08,
    isChamp: 0,
    tier: 3,
  },
  {
    leagueID: 12094,
    teamID: 63246,
    leaguename: 'Howe',
    teamname: 'Frolunda HC',
    FFname: 'FCBcn19',
    Wins: 2,
    Losses: 0,
    pointsFor: 404.2,
    pointsAgainst: 306.3,
    coachRating: 96.5,
    isChamp: 0,
    tier: 3,
  },
];
export default class Leaderboard extends Component {
  state = {
    column: null,
    data: tableData,
    direction: null,
  };

  handleSort = clickedColumn => () => {
    const { column, data, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        data: _.sortBy(data, [clickedColumn]),
        direction: 'ascending',
      });

      return;
    }

    this.setState({
      data: data.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  render() {
    const { column, data, direction } = this.state;

    return (
      <Container>
        <Segment basic>
          <Table sortable celled fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell
                  textAlign="center"
                  sorted={column === 'league' ? direction : null}
                  onClick={this.handleSort('league')}
                >
                  League
                </Table.HeaderCell>
                <Table.HeaderCell
                  textAlign="center"
                  sorted={column === 'teamName' ? direction : null}
                  onClick={this.handleSort('teamaName')}
                >
                  Team
                </Table.HeaderCell>
                <Table.HeaderCell
                  textAlign="center"
                  sorted={column === 'FFname' ? direction : null}
                  onClick={this.handleSort('FFname')}
                >
                  User
                </Table.HeaderCell>
                <Table.HeaderCell
                  textAlign="center"
                  sorted={column === 'wins' ? direction : null}
                  onClick={this.handleSort('wins')}
                >
                  Wins
                </Table.HeaderCell>
                <Table.HeaderCell
                  textAlign="center"
                  sorted={column === 'losses' ? direction : null}
                  onClick={this.handleSort('losses')}
                >
                  Losses
                </Table.HeaderCell>
                <Table.HeaderCell
                  textAlign="center"
                  sorted={column === 'pointsFor' ? direction : null}
                  onClick={this.handleSort('pointsFor')}
                >
                  Points For
                </Table.HeaderCell>
                <Table.HeaderCell
                  textAlign="center"
                  sorted={column === 'pointsAgainst' ? direction : null}
                  onClick={this.handleSort('pointsAgainst')}
                >
                  Points Against
                </Table.HeaderCell>
                <Table.HeaderCell
                  textAlign="center"
                  sorted={column === 'coachRating' ? direction : null}
                  onClick={this.handleSort('coachRating')}
                >
                  Coach Rating
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {_.map(
                data,
                ({
                  leaguename,
                  teamname,
                  FFname,
                  Wins,
                  Losses,
                  pointsFor,
                  pointsAgainst,
                  coachRating,
                  teamID,
                }) => (
                  <Table.Row key={teamID}>
                    <Table.Cell textAlign="center">{leaguename}</Table.Cell>
                    <Table.Cell textAlign="center">{teamname}</Table.Cell>
                    <Table.Cell textAlign="center">{FFname}</Table.Cell>
                    <Table.Cell textAlign="center">{Wins}</Table.Cell>
                    <Table.Cell textAlign="center">{Losses}</Table.Cell>
                    <Table.Cell textAlign="center">{pointsFor}</Table.Cell>
                    <Table.Cell textAlign="center">{pointsAgainst}</Table.Cell>
                    <Table.Cell textAlign="center">{coachRating}%</Table.Cell>
                  </Table.Row>
                ),
              )}
            </Table.Body>
          </Table>
        </Segment>
      </Container>
    );
  }
}
