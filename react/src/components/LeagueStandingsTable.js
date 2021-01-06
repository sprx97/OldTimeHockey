/* eslint-disable */
import _ from 'lodash';
import React, { Component } from 'react';
import { Table, Header, Image } from 'semantic-ui-react';
import { GetTrophy } from './Helpers'

export default class LeagueStandingsTable extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    data: null,
  };

  getData = async () => {
    const res = await fetch(
      'http://www.roldtimehockey.com/node/leagueteams?id=' +
        this.props.leagueID,
    );
    const leaders = await res.json();
    this.setState({
      data: leaders,
    });
  };

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.leagueID != this.props.leagueID)
      this.getData();
  }

  render() {
    const { data } = this.state;

    return (
      <div>
        {!data ? (
          ''
        ) : (
        <center>
          <Header as="h2" textAlign="center">
            <Image src={"/images/jerseys/" + this.props.leagueName + ".png"} />{' '}
            <a
              href={`https://www.fleaflicker.com/nhl/leagues/${this.props.leagueID}?season=${this.props.year-1}`}
              target="_blank"
            >
              {this.props.leagueName}
            </a>{' '}
            <Image src={"/images/jerseys/" + this.props.leagueName + ".png"} />
            <Header.Subheader>
              <a
                href={`http://www.sportsclubstats.com/You/${this.props.leagueName.replace(/-/g, '')}${this.props.year.toString().substring(2,4)}${parseInt(this.props.year.toString().substring(2,4))+1}.html`}
                target="_blank"
              >
                {'Playoff Odds'}
              </a>
            </Header.Subheader>
          </Header>
          <Table definition celled compact unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={2} />
                <Table.HeaderCell width={6} textAlign="center">
                  Team
                </Table.HeaderCell>
                <Table.HeaderCell width={3} textAlign="center">
                  Owner
                </Table.HeaderCell>
                <Table.HeaderCell width={2} textAlign="center">
                  Wins
                </Table.HeaderCell>
                <Table.HeaderCell width={2} textAlign="center">
                  Losses
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {_.map(
                data,
                (
                  { teamID, leagueID, name, FFname, wins, losses, isChamp, tier },
                  index,
                ) => (
                  <Table.Row
                    key={teamID}
                    style={
                      index < 6 && this.props.promotion
                        ? { backgroundColor: '#BFFFBF' }
                        : index > 11 && this.props.relegation
                        ? { backgroundColor: '#FFBFBF' }
                        : { backgroundColor: '' }
                    }
                  >
                    <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                    <Table.Cell textAlign="center">
                      {isChamp ? (<img src={GetTrophy(tier, this.props.year)} align="center" title={`D${tier}`} width="12px" height="24px" />) : ''}
                      <a
                        href={`https://www.fleaflicker.com/nhl/leagues/${leagueID}/teams/${teamID}`}
                        target="_blank"
                      >
                        {name}
                      </a>
                    </Table.Cell>
                    <Table.Cell textAlign="center">{FFname}</Table.Cell>
                    <Table.Cell textAlign="center">{wins}</Table.Cell>
                    <Table.Cell textAlign="center">{losses}</Table.Cell>
                  </Table.Row>
                ),
              )}
            </Table.Body>
          </Table>
        </center>
      )}
    </div>
    );
  }
}
