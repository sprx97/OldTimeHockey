/* eslint-disable */
import React, { Component } from 'react';
import { Container, Segment, Dropdown, Divider } from 'semantic-ui-react';
import ADPTable from "./ADPTable"

export default class ADP extends Component {
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

        const res = await fetch("http://www.roldtimehockey.com/node/adp?year=" + this.state.query + filters);
        const adp = await res.json();

        this.setState({
            data: adp,
            isLoaded: true,
            numLeagues: adp[0]["picks"].length, // highest ADP player should tell us the total number of leauges that have drafted
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
        this.setState({tierFilters: value.value}, () => {this.getData();})
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
                <ADPTable
                    data={data}
                    isLoaded={this.state.isLoaded}
                    numLeagues={this.state.numLeagues}
                />
            </Container>
        );
    }
}