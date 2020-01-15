import _ from 'lodash';
import React from 'react';
import { Container, Segment, Table, Loader } from 'semantic-ui-react';
import { divisionMapping } from './App'
import '../styles/Leagues.css';

const LiveTable = ({ column, data, direction, handleSort }) => {

  return (
    <Container>
      <Segment basic>
        {!data ? (
          <Loader active size="massive" style={{ marginTop: '150px' }} />
        ) : (
          <Table definition sortable celled selectable fixed compact>
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
                    FFid,
                    currentWeekPF,
                    regTotal,
                    PA,
                    regPATotal,
                  },
                  index,
                ) => (
                  <Table.Row key={FFid} className={leaguename}>
                    <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                    <Table.Cell textAlign="center" className={divisionMapping[leaguename]}>
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
      </Segment>
    </Container>
  );
};

export default LiveTable;
