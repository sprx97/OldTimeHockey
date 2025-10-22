import React, { Component } from 'react';
import { Container, Divider, Dropdown, Grid, Header, Segment } from 'semantic-ui-react';
import ADPTable from "./ADPTable"
import { getCurrentYear, getFirstYear } from './Helpers';

export default class ADP extends Component {
    generateDropdownOptions() {
        var options = []
        for(let year = getFirstYear(); year <= getCurrentYear(); year++) {
          options.push({ key: `${year}`, text: `${year}-${year+1}`, value: `${year}`})
        }

        return options;
      }

    dropdownOptions = this.generateDropdownOptions()
    tierOptions = [
        {key: '1', text: 'D1', value: '1'},
        {key: '2', text: 'D2', value: '2'},
        {key: '3', text: 'D3', value: '3'},
        {key: '4', text: 'D4', value: '4'},
        {key: '5', text: 'D5', value: '5'}]
    positionOptions = [
        {key: "C", text: "Center", value: "C"},
        {key: "LW", text: "Left Wing", value: "LW"},
        {key: "RW", text: "Right Wing", value: "RW"},
        {key: "D", text: "Defense", value: "D"},
        {key: "G", text: "Goalie", value: "G"}]

    state = {
        data: null,
        query: String(getCurrentYear()),
        tierFilters: null,
        positionFilters: null,
        isLoaded: false,
    };

    getData = async() => {
        var filters = "";
        if (this.state.tierFilters != null && this.state.tierFilters != "") {
            filters += "&tiers=" + this.state.tierFilters;
        }
        var query = this.state.query;

        const res1 = await fetch("https://roldtimehockey.com/node/divisionleagues?year=" + query + filters);
        const leagueids = await res1.json();

        this.setState({
            totalLeagues: leagueids.length
        });

        const res2 = await fetch("https://roldtimehockey.com/node/adp?year=" + query + filters);
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
            numLeagues: (typeof(adp[0]) === "undefined") ? 0 : adp[0]["TimesDrafted"], // highest ADP player should tell us the total number of leauges that have drafted
        });
    }

    componentDidMount() {
        this.getData();
    }

    onChange = (event, result) => {
        const { value } = result || event.target;
        this.setState({ query: value, isLoaded: false }, () => this.getData());
    };

    render() {
        const { data } = this.state;

        return (
            <Container>
                <Segment basic textAlign="center">
                    <div style={{ width: '120px', margin: '0 auto' }}>
                        <Dropdown
                            fluid
                            selection
                            options={this.dropdownOptions}
                            defaultValue={this.state.query}
                            wrapSelection={false}
                            onChange={this.onChange}
                        />
                    </div>
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
                                    onChange={(_event, value) => {this.setState({tierFilters: value.value, isLoaded: false}, () => {this.getData();})}}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown
                                    fluid
                                    search
                                    multiple
                                    selection
                                    placeholder="Position(s)"
                                    options={this.positionOptions}
                                    wrapSelection={false}
                                    onChange={(_event, value) => {this.setState({positionFilters: value.value})}}
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                {(this.state.isLoaded) ? (<Header as="h4">{this.state.numLeagues}/{this.state.totalLeagues} Completed</Header>) : ("")}
                <ADPTable
                    data={data}
                    isLoaded={this.state.isLoaded}
                    numLeagues={this.state.numLeagues}
                    positionFilters={this.state.positionFilters}
                />
		<Segment basic />
            </Container>
        );
    }
}
