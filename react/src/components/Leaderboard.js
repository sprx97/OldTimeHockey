/* eslint-disable */
import _ from 'lodash';
import React, { Component } from 'react';
import { Container, Segment, Dropdown, Grid, Button } from 'semantic-ui-react';
import RegularSeasonTable from './RegularSeasonTable';
import PlayoffsTable from './PlayoffsTable';
import CareerRegularSeasonTable from './CareerRegularSeasonTable';
import CareerPlayoffsTable from './CareerPlayoffsTable';
import LiveTable from './LiveTable';

const regularSeason = [
  '2012',
  '2013',
  '2014',
  '2015',
  '2016',
  '2017',
  '2018',
  '2019',
];
const playoffs = [
  '2012p',
  '2013p',
  '2014p',
  '2015p',
  '2016p',
  '2017p',
  '2018p',
  '2019p',
];
const careerRegularSeason = ['career'];
const careerPlayoffs = ['careerp'];
const live = ['week'];

export default class Leaderboard extends Component {
  state = {
    column: 'currentWeekPF',
    data: null,
    query: 'week',
    direction: 'descending',
    dropdownOptions: [
      {
        key: '2012',
        text: '2012-2013 Regular Season',
        value: '2012',
      },
      {
        key: '2012p',
        text: '2012-2013 Playoffs',
        value: '2012p',
      },
      {
        key: '2013',
        text: '2013-2014 Regular Season',
        value: '2013',
      },
      {
        key: '2013p',
        text: '2013-2014 Playoffs',
        value: '2013p',
      },
      {
        key: '2014',
        text: '2014-2015 Regular Season',
        value: '2014',
      },
      {
        key: '2014p',
        text: '2014-2015 Playoffs',
        value: '2014p',
      },
      {
        key: '2015',
        text: '2015-2016 Regular Season',
        value: '2015',
      },
      {
        key: '2015p',
        text: '2015-2016 Playoffs',
        value: '2015p',
      },
      {
        key: '2016',
        text: '2016-2017 Regular Season',
        value: '2016',
      },
      {
        key: '2016p',
        text: '2016-2017 Playoffs',
        value: '2016p',
      },
      {
        key: '2017',
        text: '2017-2018 Regular Season',
        value: '2017',
      },
      {
        key: '2017p',
        text: '2017-2018 Playoffs',
        value: '2017p',
      },
      {
        key: '2018',
        text: '2018-2019 Regular Season',
        value: '2018',
      },
      {
        key: '2018p',
        text: '2018-2019 Playoffs',
        value: '2018p',
      },
      {
        key: '2019',
        text: '2019-2020 Regular Season',
        value: '2019',
      },
      {
        key: '2019p',
        text: '2019-2020 Playoffs',
        value: '2019p',
        disabled: true,
      },
      {
        key: 'career',
        text: 'Career Regular Season',
        value: 'career',
      },
      {
        key: 'careerp',
        text: 'Career Playoffs',
        value: 'careerp',
      },
      {
        key: 'week',
        text: 'This Week (Live)',
        value: 'week',
      },
    ],
    seasonOptions: [
      {
        key: '2012',
        text: '2012-2013',
        value: '2012',
      },
      {
        key: '2013',
        text: '2013-2014',
        value: '2013',
      },
      {
        key: '2014',
        text: '2014-2015',
        value: '2014',
      },
      {
        key: '2015',
        text: '2015-2016',
        value: '2015',
      },
      {
        key: '2016',
        text: '2016-2017',
        value: '2016',
      },
      {
        key: '2017',
        text: '2017-2018',
        value: '2017',
      },
      {
        key: '2018',
        text: '2018-2019',
        value: '2018',
      },
      {
        key: '2019',
        text: '2019-2020',
        value: '2019',
      },
    ],
    tierOptions: [
      {
        key: '1',
        text: 'D1',
        value: '1',
      },
      {
        key: '2',
        text: 'D2',
        value: '2',
      },
      {
        key: '3',
        text: 'D3',
        value: '3',
      },
      {
        key: '4',
        text: 'D4',
        value: '4',
      },
    ],
    seasonFilters: null,
    tierFilters: null,
    lastSeasonFilters: null,
    lastTierFilters: null,
  };

  getData = async () => {
    var filters = "";
    if (this.state.seasonFilters != null && this.state.seasonFilters != "") {
      filters += "&seasons=" + this.state.seasonFilters;
    }
    if (this.state.tierFilters != null && this.state.tierFilters != "") {
      filters += "&tiers=" + this.state.tierFilters;
    }

    const res = await fetch("http://www.roldtimehockey.com/node/leaders?year=" + this.state.query + filters);
    const leaders = await res.json();

    // Sets the default column to sort by
    var defaultSort = "FFname";
    if (regularSeason.indexOf(this.state.query) > -1) {
      defaultSort = "pointsFor";
    }
    else if (playoffs.indexOf(this.state.query) > -1 || careerPlayoffs.indexOf(this.state.query) > -1) {
      defaultSort = "wins";
    }
    else if (careerRegularSeason.indexOf(this.state.query) > -1) {
      defaultSort = "PF";
    }
    else if (live.indexOf(this.state.query) > -1) {
      defaultSort = "currentWeekPF";
    }

    this.setState({
      data: _.sortBy(leaders, defaultSort).reverse(),
    });

    this.setState({lastSeasonFilters : this.state.seasonFilters});
    this.setState({lastTierFilters : this.state.tierFilters});
  };

  componentDidMount() {
    this.getData();
  }

  onChange = (event, result) => {
    const { value } = result || event.target;
    this.setState({ query: value, seasonFilters: null, tierFilters: null, lastSeasonFilters: null, lastTierFilters: null }, () => this.getData());
  };

  handleSort = clickedColumn => () => {
    const { column, data, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        data: _.sortBy(data, [clickedColumn]),
        direction: 'ascending',
      });

      return;
    }

    this.setState({
      data: data.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  handleSeasonFilterChange = (event, value) => {
    this.setState({seasonFilters : value.value});
  }

  handleTierFilterChange = (event, value) => {
    this.setState({tierFilters : value.value});
  }

  onFilter = () => {
    if (this.state.lastSeasonFilters != this.state.seasonFilters || this.state.lastTierFilters != this.state.tierFilters) {
      this.getData();
    }
  };

  render() {
    const { column, data, direction } = this.state;

    return (
      <Container>
        <Segment basic>
          <Grid centered>
            <Grid.Row columns={3}>
              <Grid.Column />
              <Grid.Column>
                <Dropdown
                  fluid
                  search
                  selection
                  options={this.state.dropdownOptions}
                  defaultValue={this.state.query}
                  wrapSelection={false}
                  onChange={this.onChange}
                />
              </Grid.Column>
              <Grid.Column />
            </Grid.Row>
          </Grid>
          {regularSeason.indexOf(this.state.query) > -1 ? (
            <RegularSeasonTable
              column={column}
              data={data}
              direction={direction}
              handleSort={this.handleSort}
            />
          ) : (
            ''
          )}
          {playoffs.indexOf(this.state.query) > -1 ? (
            <PlayoffsTable
              column={column}
              data={data}
              direction={direction}
              handleSort={this.handleSort}
            />
          ) : (
            ''
          )}
          {(careerRegularSeason.indexOf(this.state.query) > -1 || careerPlayoffs.indexOf(this.state.query) > -1) ? (
            <React.Fragment>
              <Grid centered>
                <Grid.Row columns="equal">
                  <Grid.Column>
                    <Dropdown
                      fluid
                      search
                      multiple
                      selection
                      placeholder="Season(s)"
                      options={this.state.seasonOptions}
                      wrapSelection={false}
                      onChange={this.handleSeasonFilterChange}
                    />
                  </Grid.Column>
                  <Grid.Column>
                   <Dropdown
                      fluid
                      search
                      multiple
                      selection
                      placeholder="Division(s)"
                      options={this.state.tierOptions}
                      wrapSelection={false}
                      onChange={this.handleTierFilterChange}
                    />
                  </Grid.Column>
                  <Grid.Column width={1}>
                    <Button
                      primary
                      content="Apply"
                      color="blue"
                      onClick={this.onFilter}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <CareerRegularSeasonTable
                column={column}
                data={data}
                direction={direction}
                handleSort={this.handleSort}
              />
            </React.Fragment>
          ) : (
            ''
          )}
          {careerPlayoffs.indexOf(this.state.query) > -1 ? (
            <CareerPlayoffsTable
              column={column}
              data={data}
              direction={direction}
              handleSort={this.handleSort}
            />
          ) : (
            ''
          )}
          {live.indexOf(this.state.query) > -1 ? (
            <LiveTable
              column={column}
              data={data}
              direction={direction}
              handleSort={this.handleSort}
            />
          ) : (
            ''
          )}
        </Segment>
      </Container>
    );
  }
}
