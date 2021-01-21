import _ from 'lodash';
import React from 'react';
import { Table, Loader } from 'semantic-ui-react';
import UserLink from './UserLink';
import { GetTrophy, highlightLeague, unhighlightLeague } from './Helpers'
import '../styles/Leagues.css';

const RegularSeasonTable = ({ column, data, isLoaded, direction, handleSort }) => {
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
                sorted={column === 'Wins' ? direction : null}
                onClick={handleSort('Wins')}
              >
                Wins
              </Table.HeaderCell>
              <Table.HeaderCell
                width={2}
                textAlign="center"
                sorted={column === 'Losses' ? direction : null}
                onClick={handleSort('Losses')}
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
              <Table.HeaderCell
                width={2}
                textAlign="center"
                sorted={column === 'coachRating' ? direction : null}
                onClick={handleSort('coachRating')}
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
                  isChamp,
                  leagueID,
                  leaguename,
                  FFname,
                  Wins,
                  Losses,
                  pointsFor,
                  pointsAgainst,
                  coachRating,
                  teamID,
                  teamname,
                  tier,
                  year
                },
                index,
              ) => (
                <Table.Row className={leaguename} onMouseOver={highlightLeague} onMouseLeave={unhighlightLeague}>
                  <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                  <Table.Cell textAlign="center" className={`D${tier}`}>
                    <a
                      href={`https://www.fleaflicker.com/nhl/leagues/${leagueID}?season=${year}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {leaguename}
                    </a>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {isChamp ? (<img src={GetTrophy(tier, year)} alt={`${leaguename} winner`} align="center" title={`D${tier}`} width="12px" height="24px" />) : ''}
                    <a
                      href={`https://www.fleaflicker.com/nhl/leagues/${leagueID}/teams/${teamID}?season=${year}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {teamname}
                    </a>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <UserLink FFname={FFname} />
                  </Table.Cell>
                  <Table.Cell textAlign="center">{Wins}</Table.Cell>
                  <Table.Cell textAlign="center">{Losses}</Table.Cell>
                  <Table.Cell textAlign="center">{pointsFor}</Table.Cell>
                  <Table.Cell textAlign="center">{pointsAgainst}</Table.Cell>
                  <Table.Cell textAlign="center">{coachRating}%</Table.Cell>
                </Table.Row>
              )
            )}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};

export default RegularSeasonTable;
