import _ from 'lodash';
import { Component } from 'react';
import { Table, Loader } from 'semantic-ui-react';

var MAX_PICK = 253;

export default class ADPTable extends Component {
  CheckPositionFilters(position) {
    if (this.props.positionFilters === null || this.props.positionFilters === "" || this.props.positionFilters.length === 0) return true; // empty filters just means everything

    if ((position.includes('C') || position === 'F') && this.props.positionFilters.includes('C'))
      return true;

    if ((position.includes("LW") || position === "F" || position === "W") && this.props.positionFilters.includes("LW"))
      return true;

    if ((position.includes("RW") || position === "F" || position === "W") && this.props.positionFilters.includes("RW"))
      return true;

    if ((position.includes("D")) && this.props.positionFilters.includes("D"))
      return true;

    if ((position.includes('G')) && this.props.positionFilters.includes('G'))
      return true;

    return false;
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
              {_.map(this.props.data, ({ PlayerId, PlayerName, ADP, MinPick, MaxPick, TimesDrafted, PlayerTeam, PlayerPositions }, index) =>
                this.CheckPositionFilters(PlayerPositions) ? (
                  <Table.Row className={PlayerPositions.replace('/', '')}>
                    <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                    <Table.Cell textAlign="center">{PlayerName}</Table.Cell>
                    <Table.Cell textAlign="center">
                      {
                        Number(ADP).toFixed(2)
                      }
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {MinPick}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {TimesDrafted === this.props.numLeagues
                        ? MaxPick
                        : '--'}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {Math.floor(
                        ((100 * TimesDrafted) / this.props.numLeagues) * 100
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
