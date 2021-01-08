/* eslint-disable */
import _ from 'lodash';
import React, { Component } from 'react';
import { Container, Segment, Dropdown, Header, Divider, Grid } from 'semantic-ui-react';
import LeagueRanksTable from './LeagueRanksTable';
import LeagueStandingsTable from './LeagueStandingsTable';

export default class Standings extends Component {
  state = {
    data: null,
    query: "2019",
    dropdownOptions: [
      {
        key: "2019",
        text: "2019-2020",
        value: "2019",
      },
      {
        key: "2018",
        text: "2018-2019",
        value: "2018",
      },
      {
        key: "2017",
        text: "2017-2018",
        value: "2017",
      },
      {
        key: "2016",
        text: "2016-2017",
        value: "2016",
      },
      {
        key: "2015",
        text: "2015-2016",
        value: "2015",
      },
      {
        key: "2014",
        text: "2014-2015",
        value: "2014",
      },
      {
        key: "2013",
        text: "2013-2014",
        value: "2013",
      },
      {
        key: "2012",
        text: "2012-2013",
        value: "2012",
      },      
    ],
    leagues: {},
  };

  getData = async() => {
    var newleagues = {};

    for (let i = 1; i <= 4; i++) {
      const res = await fetch("http://www.roldtimehockey.com/node/divisionleagues?year=" + this.state.query + "&tiers=" + i.toString());
      const leagueids = await res.json();
      if (!_.isEmpty(leagueids)) {
        newleagues[i] = leagueids;
      }
    }

    this.setState({leagues: newleagues});
  }

  componentWillMount() {
    this.getData();
  }

  onChange = (event, result) => {
    const {value} = result || event.target;
    this.setState({query: value}, () => this.getData());
  };

  layoutGrid = (leaguelist, relegate) => {
    let grid = [];

    let row = [];
    for (let i = 0; i < leaguelist.length; i++) {
      row.push(<Grid.Column width={5}>
        <LeagueStandingsTable
          leagueName={leaguelist[i].name}
          leagueID={leaguelist[i].id}
          year={this.state.query}
          promotion={true}
          relegation={relegate}
        /></Grid.Column>);

      if ((i+1)%3 == 0) {
        grid.push(<Grid.Row>{row}</Grid.Row>);
        row = [];
      }
    }
    if (!_.isEmpty(row))
      grid.push(<Grid.Row>{row}</Grid.Row>);

    return grid;
  };

  render() {
    const {data, query, dropdownOptions, leagues} = this.state;

    return (
      <Container fluid>
        <Segment basic textAlign="center">
          <Dropdown
            compact
            search
            selection
            options={dropdownOptions}
            defaultValue={query}
            wrapSelection={false}
            onChange={this.onChange}
          />
          <Header as="h1" textAlign="center" block>League Ranks</Header>
          <Grid centered stackable>
            <Grid.Row>
              <Grid.Column width={5}>
                <LeagueRanksTable year={query} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          {this.state.leagues[1] ? (
            <React.Fragment>
              <Divider hidden />
              <Header as="h1" textAlign="center" block>Division 1</Header>
              <Grid centered stackable>
                {this.layoutGrid(leagues[1], true)}
              </Grid>
            </React.Fragment>)
          : ''}
          {this.state.leagues[2] ? (
            <React.Fragment>
              <Divider hidden />
              <Header as="h1" textAlign="center" block>Division 2</Header>
              <Grid centered stackable>
                {this.layoutGrid(leagues[2], false)}
              </Grid>
            </React.Fragment>)
          : ''}
          {this.state.leagues[3] ? (
            <React.Fragment>
              <Divider hidden />
              <Header as="h1" textAlign="center" block>Division 3</Header>
              <Grid centered stackable>
                {this.layoutGrid(leagues[3], false)}
              </Grid>
            </React.Fragment>)
          : ''}
          {this.state.leagues[4] ? (
            <React.Fragment>
              <Divider hidden />
              <Header as="h1" textAlign="center" block>Division 4</Header>
              <Grid centered stackable>
                {this.layoutGrid(leagues[4], false)}
              </Grid>
            </React.Fragment>)
          : ''}
        </Segment>
      </Container>
    );
  }
}