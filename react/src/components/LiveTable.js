import _ from 'lodash';
import React from 'react';
import { Table, Loader } from 'semantic-ui-react';
import { highlightLeague, unhighlightLeague } from './Helpers'
import '../styles/Leagues.css';

const LiveTable = ({ column, data, isLoaded, direction, handleSort, tiers }) => {
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
                width={3}
                textAlign="center"
                sorted={column === 'leaguename' ? direction : null}
                onClick={handleSort('leaguename')}
              >
                League
              </Table.HeaderCell>
              <Table.HeaderCell
                width={6}
                textAlign="center"
                sorted={column === 'teamname' ? direction : null}
                onClick={handleSort('teamname')}
              >
                Team
              </Table.HeaderCell>
              <Table.HeaderCell
                width={3}
                textAlign="center"
                sorted={column === 'FFname' ? direction : null}
                onClick={handleSort('FFname')}
              >
                User
              </Table.HeaderCell>
              <Table.HeaderCell
                width={2}
                textAlign="center"
                sorted={column === 'currentWeekPF' ? direction : null}
                onClick={handleSort('currentWeekPF')}
              >
                PF Week
              </Table.HeaderCell>
              <Table.HeaderCell
                width={2}
                textAlign="center"
                sorted={column === 'regTotal' ? direction : null}
                onClick={handleSort('regTotal')}
              >
                PF Total
              </Table.HeaderCell>
              <Table.HeaderCell
                width={2}
                textAlign="center"
                sorted={column === 'PA' ? direction : null}
                onClick={handleSort('PA')}
              >
                PA Week
              </Table.HeaderCell>
              <Table.HeaderCell
                width={2}
                textAlign="center"
                sorted={column === 'regPATotal' ? direction : null}
                onClick={handleSort('regPATotal')}
              >
                PA Total
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
                  currentWeekPF,
                  regTotal,
                  PA,
                  regPATotal,
                  tier
                },
                index,
              ) => (
                <Table.Row className={leaguename} onMouseOver={highlightLeague} onMouseLeave={unhighlightLeague}>
                  <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                  <Table.Cell textAlign="center" className={`D${tier}`}>
                    <a
                      href={`https://www.fleaflicker.com/nhl/leagues/${leagueID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {leaguename}
                    </a>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <a
                      href={`https://www.fleaflicker.com/nhl/leagues/${leagueID}/teams/${teamID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {teamname}
                    </a>
                  </Table.Cell>
                  <Table.Cell textAlign="center">{FFname}</Table.Cell>
                  <Table.Cell textAlign="center">{currentWeekPF}</Table.Cell>
                  <Table.Cell textAlign="center">{regTotal}</Table.Cell>
                  <Table.Cell textAlign="center">{PA}</Table.Cell>
                  <Table.Cell textAlign="center">{regPATotal}</Table.Cell>
                </Table.Row>
              ),
            )}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};

export default LiveTable;
