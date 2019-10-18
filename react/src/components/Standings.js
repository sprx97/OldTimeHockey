/* eslint-disable */
import _ from 'lodash';
import React, { Component } from 'react';
import { Container, Segment, Table, Loader } from 'semantic-ui-react';

export default class Standings extends Component {
  state = {
    column: null,
    data: null,
    direction: null,
  };

  getData = async () => {
    const res = await fetch(
      'http://www.roldtimehockey.com/node/leagueranks?year=2019',
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
            <Table definition sortable celled fixed>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={1} />
                  <Table.HeaderCell
                    width={2}
                    textAlign="center"
                    sorted={column === 'name' ? direction : null}
                    onClick={this.handleSort('name')}
                  >
                    League
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={2}
                    textAlign="center"
                    sorted={column === 'PF' ? direction : null}
                    onClick={this.handleSort('PF')}
                  >
                    Total PF
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={2}
                    textAlign="center"
                    sorted={column === 'avgPF' ? direction : null}
                    onClick={this.handleSort('avgPF')}
                  >
                    Avg PF
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {_.map(data, ({ id, name, PF, avgPF }, index) => (
                  <Table.Row key={id}>
                    <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <a
                        href={`https://www.fleaflicker.com/nhl/leagues/${id}`}
                        target="_blank"
                      >
                        {name}
                      </a>
                    </Table.Cell>
                    <Table.Cell textAlign="center">{PF}</Table.Cell>
                    <Table.Cell textAlign="center">{avgPF}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Segment>
      </Container>
    );
  }
}
