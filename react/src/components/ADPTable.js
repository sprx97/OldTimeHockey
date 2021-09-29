import _ from 'lodash';
import React, { Component } from 'react';
import { Table, Loader } from 'semantic-ui-react';

var MAX_PICK = 253;

export default class ADPTable extends Component {
  CheckPositionFilters(position) {
    if (this.props.positionFilters === null || this.props.positionFilters === "") return true; // empty filters just means everything

    if (position.includes('C') || position === 'F')
      return this.props.positionFilters.includes('C')

    if (position.includes("C") || position === "F")
      return this.props.positionFilters.includes("C")

    if (position.includes("LW") || position === "F" || position === "W")
      return this.props.positionFilters.includes("LW")

    if (position.includes("RW") || position === "F" || position === "W")
      return this.props.positionFilters.includes("RW")

    if (position.includes("D"))
      return this.props.positionFilters.includes("D")

    if (position.includes('G')) return this.props.positionFilters.includes('G');

    return false; // Should not reach this
  }

  render() {
    return (
      <div>
        {!this.props.isLoaded ? (
          <Loader active size="massive" style={{ marginTop: '150px' }} />
        ) : (
          <Table definition celled compact unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={1} />
                <Table.HeaderCell width={7} textAlign="center">
                  Player
                </Table.HeaderCell>
                <Table.HeaderCell width={2} textAlign="center">
                  ADP
                </Table.HeaderCell>
                <Table.HeaderCell width={2} textAlign="center">
                  Min
                </Table.HeaderCell>
                <Table.HeaderCell width={2} textAlign="center">
                  Max
                </Table.HeaderCell>
                <Table.HeaderCell width={3} textAlign="center">
                  % Drafted
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {_.map(this.props.data, ({ name, position, picks }, index) =>
                this.CheckPositionFilters(position) ? (
                  <Table.Row className={position.replace('/', '')}>
                    <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                    <Table.Cell textAlign="center">{name}</Table.Cell>
                    <Table.Cell textAlign="center">
                      {
                        +(
                          (picks.reduce((a, b) => a + b) +
                            MAX_PICK * (this.props.numLeagues - picks.length)) /
                          this.props.numLeagues
                        ).toFixed(2)
                      }
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {Math.min.apply(null, picks)}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {picks.length === this.props.numLeagues
                        ? Math.max.apply(null, picks)
                        : '--'}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {Math.floor(
                        ((100 * picks.length) / this.props.numLeagues) * 100
                      ) / 100}
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  ''
                )
              )}
            </Table.Body>
          </Table>
        )}
      </div>
    );
  }
}
