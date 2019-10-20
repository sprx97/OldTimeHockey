/* eslint-disable */
import _ from 'lodash';
import React, { Component } from 'react';
import { Container, Segment, Table, Loader } from 'semantic-ui-react';

export default class LeagueRanksTable extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    column: 'avgPF',
    data: null,
    direction: 'descending',
  };

  getData = async () => {
    const res = await fetch(
      'http://www.roldtimehockey.com/node/leagueranks?year=' + this.props.year,
    );
    const leaders = await res.json();
    this.setState({
      data: leaders,
    });
  };

  componentDidMount() {
    this.getData();
  }

  render() {
    const { column, data, direction } = this.state;

    return (
      <Container fluid>
        <Segment basic>
          {!data ? (
            <Loader active size="large" style={{ marginTop: '13px' }} />
          ) : (
            <center>
              <Table definition celled fixed compact>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={1} />
                    <Table.HeaderCell
                      width={4}
                      textAlign="center"
                      sorted={column === 'name' ? direction : null}
                    >
                      League
                    </Table.HeaderCell>
                    <Table.HeaderCell
                      width={4}
                      textAlign="center"
                      sorted={column === 'PF' ? direction : null}
                    >
                      Total PF
                    </Table.HeaderCell>
                    <Table.HeaderCell
                      width={4}
                      textAlign="center"
                      sorted={column === 'avgPF' ? direction : null}
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
            </center>
          )}
        </Segment>
      </Container>
    );
  }
}
