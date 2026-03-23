import _ from 'lodash';
import React from 'react';
import { Table, Loader } from 'semantic-ui-react';
import UserLink from './UserLink';
import { GetTrophy, highlightLeague, unhighlightLeague } from './Helpers'
import '../styles/Leagues.css';

const PlayoffsTable = ({ column, data, isLoaded, direction, handleSort }) => {
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
                sorted={column === 'wins_playoff' ? direction : null}
                onClick={handleSort('wins_playoff')}
              >
                Wins
              </Table.HeaderCell>
              <Table.HeaderCell
                width={2}
                textAlign="center"
                sorted={column === 'losses_playoff' ? direction : null}
                onClick={handleSort('losses_playoff')}
              >
                Losses
              </Table.HeaderCell>
              <Table.HeaderCell
                width={2}
                textAlign="center"
                sorted={column === 'points_for_playoff' ? direction : null}
                onClick={handleSort('points_for_playoff')}
              >
                PF
              </Table.HeaderCell>
              <Table.HeaderCell
                width={2}
                textAlign="center"
                sorted={column === 'points_against_playoff' ? direction : null}
                onClick={handleSort('points_against_playoff')}
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
                  wins_playoff,
                  losses_playoff,
                  points_for_playoff,
                  points_against_playoff,
                  isChamp,
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
                    {isChamp ? (<img src={GetTrophy(tier, year)} align="center" title={`D${tier}`} alt={`${leaguename} winner`} width="12px" height="24px" />) : ''}
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
                  <Table.Cell textAlign="center">{wins_playoff}</Table.Cell>
                  <Table.Cell textAlign="center">{losses_playoff}</Table.Cell>
                  <Table.Cell textAlign="center">{points_for_playoff}</Table.Cell>
                  <Table.Cell textAlign="center">{points_against_playoff}</Table.Cell>
                </Table.Row>
              ),
            )}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};

export default PlayoffsTable;
