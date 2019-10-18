/* eslint-disable */
import _ from 'lodash';
import React, { Component } from 'react';
import { Container, Segment, Table, Loader } from 'semantic-ui-react';

export default class Leaderboard extends Component {
  state = {
    column: null,
    data: null,
    direction: null,
  };

  getData = async () => {
    const res = await fetch(
      'http://www.roldtimehockey.com/node/leaders?year=2019',
    );
    const leaders = await res.json();
    this.setState({
      data: leaders,
    });
  };

  componentDidMount() {
    this.getData();
  }

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
          {!data ? (
            <Loader active size="massive" style={{ marginTop: '150px' }} />
          ) : (
            <Table definition sortable celled fixed compact>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={1} />
                  <Table.HeaderCell
                    width={3}
                    textAlign="center"
                    sorted={column === 'leaguename' ? direction : null}
                    onClick={this.handleSort('leaguename')}
                  >
                    League
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={6}
                    textAlign="center"
                    sorted={column === 'teamname' ? direction : null}
                    onClick={this.handleSort('teamname')}
                  >
                    Team
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={3}
                    textAlign="center"
                    sorted={column === 'FFname' ? direction : null}
                    onClick={this.handleSort('FFname')}
                  >
                    User
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={2}
                    textAlign="center"
                    sorted={column === 'Wins' ? direction : null}
                    onClick={this.handleSort('Wins')}
                  >
                    Wins
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={2}
                    textAlign="center"
                    sorted={column === 'Losses' ? direction : null}
                    onClick={this.handleSort('Losses')}
                  >
                    Losses
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={2}
                    textAlign="center"
                    sorted={column === 'pointsFor' ? direction : null}
                    onClick={this.handleSort('pointsFor')}
                  >
                    PF
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={2}
                    textAlign="center"
                    sorted={column === 'pointsAgainst' ? direction : null}
                    onClick={this.handleSort('pointsAgainst')}
                  >
                    PA
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={2}
                    textAlign="center"
                    sorted={column === 'coachRating' ? direction : null}
                    onClick={this.handleSort('coachRating')}
                  >
                    CR%
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {_.map(
                  data,
                  (
                    {
                      leagueID,
                      leaguename,
                      teamID,
                      teamname,
                      FFname,
                      Wins,
                      Losses,
                      pointsFor,
                      pointsAgainst,
                      coachRating,
                    },
                    index,
                  ) => (
                    <Table.Row key={teamID}>
                      <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                      <Table.Cell textAlign="center">
                        <a
                          href={`https://www.fleaflicker.com/nhl/leagues/${leagueID}`}
                          target="_blank"
                        >
                          {leaguename}
                        </a>
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <a
                          href={`https://www.fleaflicker.com/nhl/leagues/${leagueID}/teams/${teamID}`}
                          target="_blank"
                        >
                          {teamname}
                        </a>
                      </Table.Cell>
                      <Table.Cell textAlign="center">{FFname}</Table.Cell>
                      <Table.Cell textAlign="center">{Wins}</Table.Cell>
                      <Table.Cell textAlign="center">{Losses}</Table.Cell>
                      <Table.Cell textAlign="center">{pointsFor}</Table.Cell>
                      <Table.Cell textAlign="center">
                        {pointsAgainst}
                      </Table.Cell>
                      <Table.Cell textAlign="center">{coachRating}%</Table.Cell>
                    </Table.Row>
                  ),
                )}
              </Table.Body>
            </Table>
          )}
        </Segment>
      </Container>
    );
  }
}
