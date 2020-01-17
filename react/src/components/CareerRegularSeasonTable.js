import _ from 'lodash';
import React from 'react';
import { Container, Segment, Table, Loader, Checkbox } from 'semantic-ui-react';

const CareerRegularSeasonTable = ({ column, data, isLoaded, direction, handleSort, tiers }) => {
  return (
    <Container>
      <Segment basic>
        {!isLoaded ? (
          <Loader active size="massive" style={{ marginTop: '150px' }} />
        ) : (
        <React.Fragment>
          <Checkbox
            label="Only show active players"
            onChange={(event, value) => {alert(value.checked);} }
          >
          </Checkbox>
          <Table definition sortable celled selectable fixed compact>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={1} />
                <Table.HeaderCell
                  width={5}
                  textAlign="center"
                  sorted={column === 'FFname' ? direction : null}
                  onClick={handleSort('FFname')}
                >
                  User
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  textAlign="center"
                  sorted={column === 'seasons' ? direction : null}
                  onClick={handleSort('seasons')}
                >
                  Years
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  textAlign="center"
                  sorted={column === 'wins' ? direction : null}
                  onClick={handleSort('wins')}
                >
                  Wins
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  textAlign="center"
                  sorted={column === 'losses' ? direction : null}
                  onClick={handleSort('losses')}
                >
                  Losses
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  textAlign="center"
                  sorted={column === 'pct' ? direction : null}
                  onClick={handleSort('pct')}
                >
                  Win Pct.
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  textAlign="center"
                  sorted={column === 'PF' ? direction : null}
                  onClick={handleSort('PF')}
                >
                  PF
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  textAlign="center"
                  sorted={column === 'avgPF' ? direction : null}
                  onClick={handleSort('avgPF')}
                >
                  Avg PF
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  textAlign="center"
                  sorted={column === 'PA' ? direction : null}
                  onClick={handleSort('PA')}
                >
                  PA
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  textAlign="center"
                  sorted={column === 'avgPA' ? direction : null}
                  onClick={handleSort('avgPA')}
                >
                  Avg PA
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  textAlign="center"
                  sorted={column === 'careerCR' ? direction : null}
                  onClick={handleSort('careerCR')}
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
                    FFname,
                    seasons,
                    wins,
                    losses,
                    pct,
                    PF,
                    avgPF,
                    PA,
                    avgPA,
                    trophies,
                    careerCR,
                  },
                  index,
                ) => (
                  <Table.Row>
                    <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                    <Table.Cell textAlign="center" className={`D${tiers[FFname] ? tiers[FFname] : "Inactive"}`}>{FFname}</Table.Cell>
                    <Table.Cell textAlign="center">{seasons}</Table.Cell>
                    <Table.Cell textAlign="center">{wins}</Table.Cell>
                    <Table.Cell textAlign="center">{losses}</Table.Cell>
                    <Table.Cell textAlign="center">{pct}</Table.Cell>
                    <Table.Cell textAlign="center">{PF}</Table.Cell>
                    <Table.Cell textAlign="center">{avgPF}</Table.Cell>
                    <Table.Cell textAlign="center">{PA}</Table.Cell>
                    <Table.Cell textAlign="center">{avgPA}</Table.Cell>
                    <Table.Cell textAlign="center">{careerCR}%</Table.Cell>
                  </Table.Row>
                ),
              )}
            </Table.Body>
          </Table>
        </React.Fragment>
        )}
      </Segment>
    </Container>
  );
};

export default CareerRegularSeasonTable;