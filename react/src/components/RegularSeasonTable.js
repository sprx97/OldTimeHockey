import _ from 'lodash';
import React from 'react';
import { Container, Segment, Table, Loader } from 'semantic-ui-react';
import '../styles/Leagues.css';

const divisionMapping = {
  "Gretzky":"d1",
  "Eastern":"d2",
  "Western":"d2",
  "Roy":"d2",
  "Hasek":"d2",
  "Brodeur":"d2",
  "Price-Murray":"d2",
  "Jones-Allen":"d2",
  "Howe":"d3",
  "Lemieux":"d3",
  "Dionne":"d3",
  "Francis":"d3",
  "Yzerman":"d3",
  "Jagr":"d3",
  "Messier":"d3",
  "Sakic":"d3",
  "Esposito":"d4",
  "Recchi":"d4",
  "Coffey":"d4",
  "Bourque":"d4",
  "Pronger":"d4",
  "Lidstrom":"d4",
  "Chelios":"d4",
  "Orr":"d4",
  "Leetch":"d4",
  "Niedermayer":"d4",
}

function highlightLeague(e) {
  var league = "NONE";
  var tr = e.target.closest("tr");

  for (var div in divisionMapping) {
    if (tr.classList.contains(div)) {
      league = div;
      break;
    }
  }

  alert(tr.parentElement.getElementsByClassName(league).length);

  // for (var row in tr.parentElement.childNodes) {
  //   if (row.classList.contains(league)) {
  //     row.classList.add("highlight");
  //   }
  // }
}

function unhighlightLeague(e) {
  var league = "NONE";
  var tr = e.target.closest("tr");

  for (var div in divisionMapping) {
    if (tr.classList.contains(div)) {
      league = div;
      break;
    }
  }

  // for (var row in tr.parentElement.childNodes) {
  //   if (row.classList.contains(league)) {
  //     row.classList.remove("highlight");
  //   }
  // }
}

const RegularSeasonTable = ({ column, data, direction, handleSort }) => {
  handleSort('pointsFor');

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
                    leagueID,
                    leaguename,
                    teamID,
                    teamname,
                    FFname,
                    Wins,
                    Losses,
                    pointsFor,
                    pointsAgainst,
                    coachRating,
                  },
                  index,
                ) => (
                  <Table.Row key={teamID} className={leaguename} onMouseOver={highlightLeague} onMouseLeave={unhighlightLeague}>
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
                    <Table.Cell textAlign="center">{Wins}</Table.Cell>
                    <Table.Cell textAlign="center">{Losses}</Table.Cell>
                    <Table.Cell textAlign="center">{pointsFor}</Table.Cell>
                    <Table.Cell textAlign="center">{pointsAgainst}</Table.Cell>
                    <Table.Cell textAlign="center">{coachRating}%</Table.Cell>
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

export default RegularSeasonTable;
