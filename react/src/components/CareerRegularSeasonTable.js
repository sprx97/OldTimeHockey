import _ from 'lodash';
import React from 'react';
import { Table, Loader } from 'semantic-ui-react';
import { generateTrophies } from './Helpers'

const CareerRegularSeasonTable = ({ column, data, isLoaded, direction, handleSort, tiers, hideInactives }) => {
  return (
    <div>
      {!isLoaded ? (
        <Loader active size="massive" style={{ marginTop: '150px' }} />
      ) : (
      <Table definition sortable celled selectable compact unstackable>
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
              <Table.Row className={`${!tiers[FFname] && hideInactives ? "hidden" : ""}`}>
                <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                <Table.Cell textAlign="center" className={`D${tiers[FFname] ? tiers[FFname] : "Inactive"}`}>{generateTrophies(trophies)}{FFname}</Table.Cell>
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
      )}
    </div>
  );
};

export default CareerRegularSeasonTable;
