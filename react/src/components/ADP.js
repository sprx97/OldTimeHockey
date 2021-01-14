/* eslint-disable */
import React, { Component } from 'react';
import { Container, Segment, Dropdown, Divider, Header } from 'semantic-ui-react';
import ADPTable from "./ADPTable"

export default class ADP extends Component {
    state = {
        data: null,
        query: "2020",
        dropdownOptions: [
            {
                key: "2020",
                text: "2020-2021",
                value: "2020",
            },
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
        tierFilters: null,
    };

    getData = async() => {
        var filters = "";
        if (this.state.tierFilters != null && this.state.tierFilters != "") {
            filters += "&tiers=" + this.state.tierFilters;
        }
        var query = this.state.query;

        const res1 = await fetch("http://www.roldtimehockey.com/node/divisionleagues?year=" + query + filters);
        const leagueids = await res1.json();

        this.setState({
            totalLeagues: leagueids.length
        });

        const res2 = await fetch("http://www.roldtimehockey.com/node/adp?year=" + query + filters);
        const adp = await res2.json();

        // return early if our state has changed since the fetch requests were made
        var newfilters = ""
        if (this.state.tierFilters != null && this.state.tierFilters != "") {
            newfilters += "&tiers=" + this.state.tierFilters;
        }
        if (query != this.state.query || filters != newfilters)
            return;

        this.setState({
            data: adp,
            isLoaded: true,
            numLeagues: (typeof(adp[0]) === "undefined") ? 0 : adp[0]["picks"].length, // highest ADP player should tell us the total number of leauges that have drafted
        });
    }

    componentDidMount() {
        this.getData();
    }

    onChange = (event, result) => {
        const { value } = result || event.target;
        this.setState({ query: value, isLoaded: false }, () => this.getData());
    };

    handleTierFilterChange = (event, value) => {
        this.setState({tierFilters: value.value, isLoaded: false }, () => {this.getData();})
    }

    render() {
        const { data } = this.state;

        return (
            <Container>
                <Segment basic textAlign="center">
                    <Dropdown
                        compact
                        search
                        selection
                        options={this.state.dropdownOptions}
                        defaultValue={this.state.query}
                        wrapSelection={false}
                        onChange={this.onChange}
                    />
                    <Divider hidden />
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
                </Segment>
                {(this.state.isLoaded) ? (<Header as="h4">{this.state.numLeagues}/{this.state.totalLeagues} Completed</Header>) : ("")}
                <ADPTable
                    data={data}
                    isLoaded={this.state.isLoaded}
                    numLeagues={this.state.numLeagues}
                />
            </Container>
        );
    }
}