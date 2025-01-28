import _ from 'lodash';
import React, { Component } from 'react';
import { Table, Header, Image, Icon } from 'semantic-ui-react';
import { getCurrentYear, GetTrophy } from './Helpers';
import { Link } from 'react-router-dom';

export default class LeagueStandingsTable extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    data: null,
  };

  getData = async () => {
    const res = await fetch('https://roldtimehockey.com/node/leagueteams?id=' + this.props.leagueID + "&year=" + this.props.year);
    const leaders = await res.json();

    const res2 = await fetch(`https://roldtimehockey.com/node/v2/standings/advanced/playoff_odds?league=${this.props.leagueID}&year=${this.props.year}`) // (And week defaults to current week)
    const playoff_odds = await res2.json();

    var has_ties = false;
    for (const team in leaders) {
      if (leaders[team]["ties"] != "0") {
        has_ties = true;
      }

      if (Object.keys(playoff_odds).length != 0) {
        leaders[team]["playoff_odds"] = playoff_odds[leaders[team]["teamID"].toString()]["playoff_odds"];
        leaders[team]["bye_odds"] = (playoff_odds[leaders[team]["teamID"].toString()]["seeds"][0] + playoff_odds[leaders[team]["teamID"].toString()]["seeds"][1]).toFixed(2);
        leaders[team]["d3_odds"] = (playoff_odds[leaders[team]["teamID"].toString()]["seeds"][12] + playoff_odds[leaders[team]["teamID"].toString()]["seeds"][13]).toFixed(2);
      }
    }

    this.setState({
      data: leaders,
      has_ties: has_ties
    });
  };

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.leagueID != this.props.leagueID || prevProps.year != this.props.year)
      this.getData();
  }

  render() {
    const { data, has_ties } = this.state;

    return (
      <div>
        {!data ? (
          ''
        ) : (
        <center>
          <Header as="h2" textAlign="center">
            <Image src={"/images/jerseys/" + this.props.leagueName + ".png"} />{' '}
            <a
              href={`https://www.fleaflicker.com/nhl/leagues/${this.props.leagueID}?season=${this.props.year}`}
              target="_blank"
            >
              {this.props.leagueName}
            </a>{' '}
            <Link to={`/league/${this.props.leagueID}`}>
              <Icon 
                name="info circle" 
                style={{ marginLeft: '5px', cursor: 'pointer' }}
              />
            </Link>
            <Image src={"/images/jerseys/" + this.props.leagueName + ".png"} />
            { this.props.years < 2023 ?
            <Header.Subheader>
              <a
                href={`http://www.sportsclubstats.com/You/${this.props.leagueName.replace(/-/g, '')}${this.props.year.toString().substring(2,4)}${parseInt(this.props.year.toString().substring(2,4))+1}2.html`}
                target="_blank"
              >
                {'Playoff Odds'}
              </a>
            </Header.Subheader>
            : ''
            }
          </Header>
          <Table definition celled compact unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={1} />
                <Table.HeaderCell width={6} textAlign="center">Team</Table.HeaderCell>
                <Table.HeaderCell width={3} textAlign="center">Owner</Table.HeaderCell>
                <Table.HeaderCell width={1} textAlign="center">Wins</Table.HeaderCell>
                <Table.HeaderCell width={1} textAlign="center">Losses</Table.HeaderCell>
                {has_ties ? (<Table.HeaderCell width={1} textAlign="center">Ties</Table.HeaderCell>) : ''}
                {this.props.year == getCurrentYear() ? <Table.HeaderCell width={1} textAlign="center">Playoff%</Table.HeaderCell> : ''}
                {this.props.year == getCurrentYear() ? <Table.HeaderCell width={1} textAlign="center">Bye%</Table.HeaderCell> : ''}
                {this.props.year == getCurrentYear() && data[0] && "tier" in data[0] && data[0]["tier"] == 1 ? <Table.HeaderCell width={1} textAlign="center">D3%</Table.HeaderCell> : ''}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {_.map(
                data,
                (
                  { teamID, leagueID, name, FFname, wins, losses, isChamp, tier, ties, is_replacement, playoff_odds, bye_odds, d3_odds },
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
                        href={`https://www.fleaflicker.com/nhl/leagues/${leagueID}/teams/${teamID}?season=${this.props.year}`}
                        target="_blank"
                      >
                        {name}
                      </a>
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {FFname}
                      {is_replacement ? "*" : ""}
                    </Table.Cell>
                    <Table.Cell textAlign="center">{wins}</Table.Cell>
                    <Table.Cell textAlign="center">{losses}</Table.Cell>
                    {has_ties ? (<Table.Cell textAlign="center">{ties == 0 ? '' : ties}</Table.Cell>) : ''}
                    {this.props.year == getCurrentYear() ? (<Table.Cell textAlign="center">{playoff_odds !== undefined ? playoff_odds : '-'}</Table.Cell>) : ''}
                    {this.props.year == getCurrentYear() ? (<Table.Cell textAlign="center">{bye_odds !== undefined ? bye_odds : '-'}</Table.Cell>) : ''}
                    {this.props.year == getCurrentYear() && tier == 1 ? (<Table.Cell textAlign="center">{d3_odds !== undefined ? d3_odds : '-'}</Table.Cell>) : ''}
                  </Table.Row>
                ),
              )}
            </Table.Body>
          </Table>
          <p>{"* = midseason replacement manager"}</p>
        </center>
      )}
    </div>
    );
  }
}
