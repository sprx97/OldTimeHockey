import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import {
  Container,
  Segment,
  Dropdown,
  Grid,
  Checkbox,
  Divider,
  Input,
} from 'semantic-ui-react';
import RegularSeasonTable from './RegularSeasonTable';
import PlayoffsTable from './PlayoffsTable';
import CareerRegularSeasonTable from './CareerRegularSeasonTable';
import CareerPlayoffsTable from './CareerPlayoffsTable';
import LiveTable from './LiveTable';
import { isPlayoffWeek } from './Helpers';

export default class Leaderboard extends Component {
  numSeasonsOptions = [
    { key: 0, text: '0', value: 0 },
    { key: 1, text: '1', value: 1 },
    { key: 2, text: '2', value: 2 },
    { key: 3, text: '3', value: 3 },
    { key: 4, text: '4', value: 4 },
    { key: 5, text: '5', value: 5 },
    { key: 6, text: '6', value: 6 },
    { key: 7, text: '7', value: 7 },
    { key: 8, text: '8', value: 8 },
    { key: 9, text: '9', value: 9 },
    { key: 10, text: '10', value: 10 },
  ];

  tierOptions = [
    { key: '1', text: 'D1', value: '1' },
    { key: '2', text: 'D2', value: '2' },
    { key: '3', text: 'D3', value: '3' },
    { key: '4', text: 'D4', value: '4' },
  ];

  dropdownOptions = [
    { key: '2012', text: '2012-2013 Regular Season', value: '2012' },
    { key: '2012p', text: '2012-2013 Playoffs', value: '2012p' },
    { key: '2013', text: '2013-2014 Regular Season', value: '2013' },
    { key: '2013p', text: '2013-2014 Playoffs', value: '2013p' },
    { key: '2014', text: '2014-2015 Regular Season', value: '2014' },
    { key: '2014p', text: '2014-2015 Playoffs', value: '2014p' },
    { key: '2015', text: '2015-2016 Regular Season', value: '2015' },
    { key: '2015p', text: '2015-2016 Playoffs', value: '2015p' },
    { key: '2016', text: '2016-2017 Regular Season', value: '2016' },
    { key: '2016p', text: '2016-2017 Playoffs', value: '2016p' },
    { key: '2017', text: '2017-2018 Regular Season', value: '2017' },
    { key: '2017p', text: '2017-2018 Playoffs', value: '2017p' },
    { key: '2018', text: '2018-2019 Regular Season', value: '2018' },
    { key: '2018p', text: '2018-2019 Playoffs', value: '2018p' },
    { key: '2019', text: '2019-2020 Regular Season', value: '2019' },
    { key: '2020', text: '2020-2021 Regular Season', value: '2020' },
    { key: '2020p', text: '2020-2021 Playoffs', value: '2020p' },
    { key: '2021', text: '2021-2022 Regular Season', value: '2021' },
    { key: '2021p', text: '2021-2022 Playoffs', value: '2021p' },
    { key: 'career', text: 'Career Regular Season', value: 'career' },
    { key: 'careerp', text: 'Career Playoffs', value: 'careerp' },
    { key: 'week', text: 'This Week (Live)', value: 'week' },
  ];

  seasonOptions = [
    { key: '2012', text: '2012-2013', value: '2012' },
    { key: '2013', text: '2013-2014', value: '2013' },
    { key: '2014', text: '2014-2015', value: '2014' },
    { key: '2015', text: '2015-2016', value: '2015' },
    { key: '2016', text: '2016-2017', value: '2016' },
    { key: '2017', text: '2017-2018', value: '2017' },
    { key: '2018', text: '2018-2019', value: '2018' },
    { key: '2019', text: '2019-2020', value: '2019' },
    { key: '2020', text: '2020-2021', value: '2020' },
    { key: '2021', text: '2021-2022', value: '2021' },
  ];

  state = {
    column: null,
    data: null,
    query: 'week',
    direction: 'descending',
    seasonFilters: null,
    tierFilters: null,
    minSeasons: 0,
    hideInactives: false,
    managerFilter: null,
    week: -1
  };

  currentTiers = {};

  reversedColumns = ['leaguename', 'teamname', 'FFname'];
  getSortedData(data, clickedColumn) {
    var sortedData = _.sortBy(data, [
      function(datum) {
        if (typeof datum[clickedColumn] === 'string')
          return datum[clickedColumn].toLowerCase();
        else return datum[clickedColumn];
      },
      'regTotal',
      'pointsFor',
    ]); // regTotal and pointsFor are secondary sorts depending on view

    if (this.reversedColumns.indexOf(clickedColumn) > -1) {
      return sortedData;
    }

    return sortedData.reverse();
  }

  getData = async () => {
    const week = parseInt(await (await fetch('https://roldtimehockey.com/node/getweek')).json());
    const year = parseInt(await (await fetch('https://roldtimehockey.com/node/getyear')).json());

    var filters = '';
    if (this.state.seasonFilters != null && this.state.seasonFilters != '') {
      filters += '&seasons=' + this.state.seasonFilters;
    }
    if (this.state.tierFilters != null && this.state.tierFilters != '') {
      filters += '&tiers=' + this.state.tierFilters;
    }
    if (this.state.minSeasons > 0) {
      filters += '&minseasons=' + this.state.minSeasons;
    }

    const res = await fetch(
      'https://roldtimehockey.com/node/leaders?year=' +
        this.state.query +
        filters
    );
    const leaders = await res.json();

    // Sets the default column to sort by
    var defaultSort = 'FFname';
    if (this.state.query.slice(-1) == 'p' || this.state.query == 'careerp') {
      // playoffs and career playoffs
      defaultSort = 'wins';
    } else if (this.state.query == 'career') {
      // career regular season
      defaultSort = 'PF';
    } else if (this.state.query == 'week') {
      // live week
      defaultSort = 'currentWeekPF';
    } else {
      // Regular Season
      defaultSort = 'pointsFor';
    }

    // Get the current tier styling if this is a career leaderboard
    if (
      Object.keys(this.currentTiers).length == 0 &&
      this.state.query.includes('career')
    ) {
      const tierres = await fetch(
        'https://roldtimehockey.com/node/currenttier?year=' +
          this.seasonOptions[this.seasonOptions.length - 1].key
      );
      const tiers = await tierres.json();
      for (var i = 0; i < tiers.length; i++) {
        this.currentTiers[tiers[i].FFname] = tiers[i].tier;
      }
    }

    this.setState({
      data: this.getSortedData(leaders, defaultSort),
      isLoaded: true,
      column: leaders.length > 0 ? defaultSort : null,
      isplayoffs: isPlayoffWeek(week, year)
    });
  };

  componentDidMount() {
    this.getData();
  }

  onChange = (event, result) => {
    const { value } = result || event.target;
    this.setState(
      { query: value, isLoaded: false },
      () => this.getData()
    );
  };

  handleSort = (clickedColumn) => () => {
    const { column, data, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        data: this.getSortedData(data, clickedColumn),
        direction:
          this.reversedColumns.indexOf(clickedColumn) > -1
            ? 'ascending'
            : 'descending',
      });

      return;
    }

    this.setState({
      data: data.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  render() {
    const { column, data, direction } = this.state;

    return (
      <Container>
        <Segment basic textAlign="center">
          <div style={{ width: '220px', margin: '0 auto' }}>
            <Dropdown
              fluid
              selection
              options={this.dropdownOptions}
              defaultValue={this.state.query}
              wrapSelection={false}
              onChange={this.onChange}
            />
          </div>
          <Fragment>
            <Divider hidden />
            <Grid centered>
              <Grid.Row columns="equal">
                <Grid.Column>
                  <Dropdown
                    fluid
                    search
                    multiple
                    selection
                    placeholder="Division(s)"
                    options={this.tierOptions}
                    wrapSelection={false}
                    onChange={(event, value) => {
                      this.setState({ tierFilters: value.value }, () => {
                        this.getData();
                      });
                    }}
                  />
                </Grid.Column>
                {this.state.query.includes('career') ? (
                  <Grid.Column>
                    <Dropdown
                      fluid
                      search
                      multiple
                      selection
                      placeholder="Season(s)"
                      options={this.seasonOptions}
                      wrapSelection={false}
                      onChange={(event, value) => {
                        this.setState({ seasonFilters: value.value }, () => {
                          this.getData();
                        });
                      }}
                    />
                  </Grid.Column>
                ) : (
                  ''
                )}
                {this.state.query.includes('career') ? (
                  <Grid.Column>
                    <Dropdown
                      fluid
                      search
                      selection
                      placeholder="Min years"
                      options={this.numSeasonsOptions}
                      onChange={(event, value) => {
                        this.setState({ minSeasons: value.value }, () => {
                          this.getData();
                        });
                      }}
                    />
                  </Grid.Column>
                ) : (
                  ''
                )}
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Input
                    fluid
                    placeholder="Search teams/managers..."
                    icon="search"
                    onChange={(event) => {
                      // Setting the empty string to null saves some edge cases later.
                      const managerFilter =
                        event.target.value === '' ? null : event.target.value;
                      this.setState({ managerFilter: managerFilter });
                    }}
                  />
                </Grid.Column>
              </Grid.Row>
              {this.state.query.includes('career') ? (
                <Grid.Row columns="equal">
                  <Grid.Column>
                    <Checkbox
                      label="Only show active managers"
                      onChange={(event, value) => {
                        this.setState({ hideInactives: value.checked }, () => {
                          this.getData();
                        });
                      }}
                    ></Checkbox>
                  </Grid.Column>
                </Grid.Row>
              ) : (
                ''
              )}
            </Grid>
          </Fragment>
        </Segment>
        {this.state.query.slice(4, 5) == 'p' ? (
          <PlayoffsTable
            column={column}
            data={data}
            isLoaded={this.state.isLoaded}
            direction={direction}
            handleSort={this.handleSort}
          />
        ) : (
          ''
        )}
        {!isNaN(parseInt(this.state.query)) && this.state.query.length == 4 ? (
          <RegularSeasonTable
            column={column}
            data={data}
            isLoaded={this.state.isLoaded}
            direction={direction}
            handleSort={this.handleSort}
          />
        ) : (
          ''
        )}
        {this.state.query == 'career' ? (
          <CareerRegularSeasonTable
            column={column}
            data={data}
            isLoaded={this.state.isLoaded}
            direction={direction}
            handleSort={this.handleSort}
            tiers={this.currentTiers}
            hideInactives={this.state.hideInactives}
          />
        ) : (
          ''
        )}
        {this.state.query == 'careerp' ? (
          <CareerPlayoffsTable
            column={column}
            data={data}
            isLoaded={this.state.isLoaded}
            direction={direction}
            handleSort={this.handleSort}
            tiers={this.currentTiers}
            hideInactives={this.state.hideInactives}
          />
        ) : (
          ''
        )}
        {this.state.query == 'week' ? (
          <LiveTable
            column={column}
            data={data}
            isLoaded={this.state.isLoaded}
            direction={direction}
            handleSort={this.handleSort}
            tiers={this.currentTiers}
            hideInactives={this.state.hideInactives}
            managerFilter={this.state.managerFilter}
            isplayoffs={this.state.isplayoffs}
          />
        ) : (
          ''
        )}
        <Divider hidden />
        <Divider hidden />
      </Container>
    );
  }
}
