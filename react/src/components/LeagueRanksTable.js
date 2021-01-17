/* eslint-disable */
import _ from 'lodash';
import React, { Component } from 'react';
import { Table, Loader } from 'semantic-ui-react';

export default class LeagueRanksTable extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    column: 'avgPF',
    data: null,
    direction: 'descending',
  };

  reversedColumns = ["StdDev"];
  getSortedData(data, clickedColumn) {
    var sortedData = _.sortBy(data, [function(datum) { 
                                        if (typeof datum[clickedColumn] === "string") 
                                            return datum[clickedColumn].toLowerCase(); 
                                        else 
                                            return datum[clickedColumn]; }])
              
    if (this.reversedColumns.indexOf(clickedColumn) > -1) {
        return sortedData;
    }

    return sortedData.reverse();
  }

  handleSort = clickedColumn => () => {
    const { column, data, direction } = this.state;

    // Sorting by a new column
    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        data: this.getSortedData(data, clickedColumn),
        direction: (this.reversedColumns.indexOf(clickedColumn) > -1) ? "ascending" : "descending",
      });

      return;
    }

    this.setState({
      data: data.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  getData = async () => {
    const res = await fetch(
      'http://www.roldtimehockey.com/node/leagueranks?year=' + this.props.year,
    );
    const leaders = await res.json();
    this.setState({
      data: leaders,
      column: "avgPF",
      direction: "descending"
    });
  };

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.year != this.props.year)
      this.getData();
  }

  render() {
    const { column, data, direction } = this.state;

    return (
      <div>
        {!data ? (
          <Loader active size="large" style={{ marginTop: '13px' }} />
        ) : (
          <Table definition celled compact sortable unstackable center>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={2} />
                <Table.HeaderCell
                  width={4}
                  textAlign="center"
                  sorted={column === 'name' ? direction : null}
                >
                  League
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={3}
                  textAlign="center"
                  sorted={column === 'PF' ? direction : null}
                >
                  Total PF
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={3}
                  textAlign="center"
                  sorted={column === 'avgPF' ? direction : null}
                  onClick={this.handleSort("avgPF")}
                >
                  Avg PF
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={3}
                  textAlign="center"
                  sorted={column === 'StdDev' ? direction : null}
                  onClick={this.handleSort("StdDev")}
                >
                  StdDev
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {_.map(data, ({ id, name, PF, avgPF, stddev }, index) => (
                <Table.Row key={id}>
                  <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                  <Table.Cell textAlign="center">
                    <a
                      href={`https://www.fleaflicker.com/nhl/leagues/${id}?season=${this.props.year}`}
                      target="_blank"
                    >
                      {name}
                    </a>
                  </Table.Cell>
                  <Table.Cell textAlign="center">{PF}</Table.Cell>
                  <Table.Cell textAlign="center">{avgPF}</Table.Cell>
                  <Table.Cell textAlign="center">{stddev}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    );
  }
}
