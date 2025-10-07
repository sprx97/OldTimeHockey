import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Container, Segment, Dropdown, Grid, Checkbox, Divider, Input } from 'semantic-ui-react';
import RegularSeasonTable from './RegularSeasonTable';
import PlayoffsTable from './PlayoffsTable';
import CareerRegularSeasonTable from './CareerRegularSeasonTable';
import CareerPlayoffsTable from './CareerPlayoffsTable';
import LiveTable from './LiveTable';
import { getCurrentYear, getFirstYear, isPlayoffWeek } from './Helpers';

export default class Leaderboard extends Component {
  tierOptions = [
    { key: '1', text: 'D1', value: '1' },
    { key: '2', text: 'D2', value: '2' },
    { key: '3', text: 'D3', value: '3' },
    { key: '4', text: 'D4', value: '4' },
    { key: '5', text: 'D5', value: '5' },
  ];

  generateNumSeasonsOptions() {
    var options = [];
    for (let n = 1; n <= (getCurrentYear() - getFirstYear() + 1); n++) {
      options.push({ key: n, text: `${n}`, value: n });
    }

    return options;
  }
  numSeasonsOptions = this.generateNumSeasonsOptions();

  generateDropdownOptions() {
    var options = []
    var currentYear = getCurrentYear();

    for(let year = getFirstYear(); year < currentYear; year++) {
      options.push({ key: `${year}`, text: `${year}-${year+1} Regular Season`, value: `${year}`})

      // No playoffs in 2019 -- COVID year
      if (year != 2019)
        options.push({ key: `${year}p`, text: `${year}-${year+1} Playoffs`, value: `${year}p`})
    }

    options.push({ key: `${currentYear}`, text: `${currentYear}-${currentYear+1} Regular Season`, value: `${currentYear}`})
    options.push({ key: `${currentYear}p`, text: `${currentYear}-${currentYear+1} Playoffs`, value: `${currentYear}p`})

    options.push({ key: 'career', text: 'Career Regular Season', value: 'career' })
    options.push({ key: 'careerp', text: 'Career Playoffs', value: 'careerp' })
    options.push({ key: 'week', text: 'This Week (Live)', value: 'week' })

    return options;
  }
  dropdownOptions = this.generateDropdownOptions();

  generateSeasonsOptions() {
    var options = []
    for(let year = getFirstYear(); year <= getCurrentYear(); year++) {
      options.push({ key: `${year}`, text: `${year}-${year+1}`, value: `${year}`})
    }

    return options;
  }
  seasonOptions = this.generateSeasonsOptions();

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
      'postTotal',
      'regTotal',
      'pointsFor',
    ]); // postTotal, regTotal, and pointsFor are secondary sorts depending on view

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
