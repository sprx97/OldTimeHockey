import _ from 'lodash';
import React, { Component } from 'react';
import { Container, Segment, Dropdown, Header, Divider, Grid } from 'semantic-ui-react';
import LeagueRanksTable from './LeagueRanksTable';
import LeagueStandingsTable from './LeagueStandingsTable';
import { getCurrentYear, getFirstYear } from './Helpers';

export default class Standings extends Component {
  generateDropdownOptions() {
    var options = []
    for(let year = getFirstYear(); year <= getCurrentYear(); year++) {
      options.push({ key: `${year}`, text: `${year}-${year+1}`, value: `${year}`})
    }

    return options;
  }
  
  state = {
    data: null,
    query: String(getCurrentYear()),
    dropdownOptions: this.generateDropdownOptions(),
    leagues: {},
  };

  getData = async () => {
    var newleagues = {};

    for (let i = 1; i <= 4; i++) {
      const res = await fetch(
        'https://roldtimehockey.com/node/divisionleagues?year=' +
          this.state.query +
          '&tiers=' +
          i.toString()
      );
      const leagueids = await res.json();
      if (!_.isEmpty(leagueids)) {
        newleagues[i] = leagueids;
      }
    }

    this.setState({ leagues: newleagues });
  };

  componentDidMount() {
    this.getData();
  }

  onChange = (event, result) => {
    const { value } = result || event.target;
    this.setState({ query: value }, () => this.getData());
  };

  layoutGrid = (leaguelist, relegate) => {
    let grid = [];

    let row = [];
    for (let i = 0; i < leaguelist.length; i++) {
      row.push(
        <Grid.Column width={8} key={leaguelist[i].id}>
          <LeagueStandingsTable
            leagueName={leaguelist[i].name}
            leagueID={leaguelist[i].id}
            year={this.state.query}
            promotion={true}
            relegation={relegate}
          />
        </Grid.Column>
      );

      let MAX_LEAGUES_PER_ROW = 2;
      if ((i + 1) % MAX_LEAGUES_PER_ROW == 0) {
        grid.push(<Grid.Row key={i}>{row}</Grid.Row>);
        row = [];
      }
    }
    if (!_.isEmpty(row)) grid.push(<Grid.Row key="lastrow">{row}</Grid.Row>);

    return grid;
  };

  render() {
    const { data, query, dropdownOptions, leagues } = this.state;

    return (
      <Container fluid>
        <Segment basic textAlign="center">
          <div style={{ width: '120px', margin: '0 auto' }}>
            <Dropdown
              fluid
              selection
              options={dropdownOptions}
              defaultValue={query}
              wrapSelection={false}
              onChange={this.onChange}
            />
          </div>
          <Header as="h1" textAlign="center" block>
            League Ranks
          </Header>
          <Grid centered stackable>
            <Grid.Row>
              <Grid.Column width={8}>
                <LeagueRanksTable year={query} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          {this.state.leagues[1] ? (
            <React.Fragment>
              <Divider hidden />
              <Header as="h1" textAlign="center" block>
                Division 1
              </Header>
              <Grid centered stackable>
                {this.layoutGrid(this.state.leagues[1], true)}
              </Grid>
            </React.Fragment>
          ) : (
            ''
          )}
          {this.state.leagues[2] ? (
            <React.Fragment>
              <Divider hidden />
              <Header as="h1" textAlign="center" block>
                Division 2
              </Header>
              <Grid centered stackable>
                {this.layoutGrid(this.state.leagues[2], false)}
              </Grid>
            </React.Fragment>
          ) : (
            ''
          )}
          {this.state.leagues[3] ? (
            <React.Fragment>
              <Divider hidden />
              <Header as="h1" textAlign="center" block>
                Division 3
              </Header>
              <Grid centered stackable>
                {this.layoutGrid(this.state.leagues[3], false)}
              </Grid>
            </React.Fragment>
          ) : (
            ''
          )}
          {this.state.leagues[4] ? (
            <React.Fragment>
              <Divider hidden />
              <Header as="h1" textAlign="center" block>
                Division 4
              </Header>
              <Grid centered stackable>
                {this.layoutGrid(this.state.leagues[4], false)}
              </Grid>
            </React.Fragment>
          ) : (
            ''
          )}
        </Segment>
      </Container>
    );
  }
}
