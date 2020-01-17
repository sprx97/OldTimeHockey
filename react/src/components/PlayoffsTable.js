import _ from 'lodash';
import React from 'react';
import { Container, Segment, Table, Loader } from 'semantic-ui-react';
import { divisionMapping } from './App'
import '../styles/Leagues.css';

const PlayoffsTable = ({ column, data, isLoaded, direction, handleSort }) => {
  return (
    <Container>
      <Segment basic>
        {!isLoaded ? (
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
                  sorted={column === 'pointsFor' ? direction : null}
                  onClick={handleSort('pointsFor')}
                >
                  PF
                </Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  textAlign="center"
                  sorted={column === 'pointsAgainst' ? direction : null}
                  onClick={handleSort('pointsAgainst')}
                >
                  PA
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
                    wins,
                    losses,
                    pointsFor,
                    pointsAgainst,
                    isChamp
                  },
                  index,
                ) => (
                  <Table.Row className={leaguename}>
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
                      {isChamp ? (<img src={`/images/trophies/${divisionMapping[leaguename]}Champion.png`} align="center" title={`${divisionMapping[leaguename]}`} alt={`${leaguename} winner`} width="12px" height="24px" />) : ''}
                      <a
                        href={`https://www.fleaflicker.com/nhl/leagues/${leagueID}/teams/${teamID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {teamname}
                      </a>
                    </Table.Cell>
                    <Table.Cell textAlign="center">{FFname}</Table.Cell>
                    <Table.Cell textAlign="center">{wins}</Table.Cell>
                    <Table.Cell textAlign="center">{losses}</Table.Cell>
                    <Table.Cell textAlign="center">{pointsFor}</Table.Cell>
                    <Table.Cell textAlign="center">{pointsAgainst}</Table.Cell>
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

export default PlayoffsTable;
