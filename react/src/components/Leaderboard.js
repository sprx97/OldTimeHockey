/* eslint-disable */
import _ from 'lodash';
import React, { Component } from 'react';
import {
  Container,
  Segment,
  Table,
  Loader,
  Dropdown,
  Grid,
} from 'semantic-ui-react';

export default class Leaderboard extends Component {
  state = {
    column: 'pointsFor',
    data: null,
    query: '2019',
    direction: 'descending',
    dropdownOptions: [
      {
        key: '2012',
        text: '2012-2013 Regular Season',
        value: '2012',
      },
      {
        key: '2012p',
        text: '2012-2013 Playoffs',
        value: '2012p',
      },
      {
        key: '2013',
        text: '2013-2014 Regular Season',
        value: '2013',
      },
      {
        key: '2013p',
        text: '2013-2014 Playoffs',
        value: '2013p',
      },
      {
        key: '2014',
        text: '2014-2015 Regular Season',
        value: '2014',
      },
      {
        key: '2014p',
        text: '2014-2015 Playoffs',
        value: '2014p',
      },
      {
        key: '2015',
        text: '2015-2016 Regular Season',
        value: '2015',
      },
      {
        key: '2015p',
        text: '2015-2016 Playoffs',
        value: '2015p',
      },
      {
        key: '2016',
        text: '2016-2017 Regular Season',
        value: '2016',
      },
      {
        key: '2016p',
        text: '2016-2017 Playoffs',
        value: '2016p',
      },
      {
        key: '2017',
        text: '2017-2018 Regular Season',
        value: '2017',
      },
      {
        key: '2017p',
        text: '2017-2018 Playoffs',
        value: '2017p',
      },
      {
        key: '2018',
        text: '2018-2019 Regular Season',
        value: '2018',
      },
      {
        key: '2018p',
        text: '2018-2019 Playoffs',
        value: '2018p',
      },
      {
        key: '2019',
        text: '2019-2020 Regular Season',
        value: '2019',
      },
      {
        key: '2019p',
        text: '2019-2020 Playoffs',
        value: '2019p',
      },
      {
        key: 'career',
        text: 'Career Regular Season',
        value: 'career',
      },
      {
        key: 'careerp',
        text: 'Career Playoffs',
        value: 'careerp',
      },
      {
        key: 'week',
        text: 'This Week (Live)',
        value: 'week',
      },
    ],
  };

  getData = async () => {
    const res = await fetch(
      'http://www.roldtimehockey.com/node/leaders?year=' + this.state.query,
    );
    const leaders = await res.json();
    this.setState({
      data: leaders,
    });
  };

  componentDidMount() {
    this.getData();
  }

  onChange = (event, result) => {
    const { value } = result || event.target;
    this.setState({ query: value });
    setTimeout(() => {
      this.getData();
    }, 50);
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
    const { column, data, direction, dropdownOptions } = this.state;

    return (
      <Container>
        <Segment basic>
          <Grid centered>
            <Grid.Row columns={3}>
              <Grid.Column />
              <Grid.Column>
                <Dropdown
                  fluid
                  search
                  selection
                  options={dropdownOptions}
                  defaultValue="This Week (Live)"
                  wrapSelection={false}
                  onChange={this.onChange}
                />
              </Grid.Column>
              <Grid.Column />
            </Grid.Row>
          </Grid>
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
