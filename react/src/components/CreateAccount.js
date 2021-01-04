/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Segment } from 'semantic-ui-react';

export default class CreateAccount extends Component {
    state = {
        email: "",
        pass1: "",
        pass2: ""
    };

    handleEmail = event => {this.setState({email: event.target.value});}
    handlePass1 = event => {this.setState({pass1: event.target.value});}
    handlePass2 = event => {this.setState({pass2: event.target.value});}

    onCreateAccount = (e) => {
        e.preventDefault();

        // validate password is good
        // check if username is already in database
        // hash password
        // use node to create account
        // check JSON respones
        // Show success or failure message
    
        alert(this.state.email + " " + this.state.pass1 + " " + this.state.pass2);

    /*    const res = await fetch(
            'http://www.roldtimehockey.com/node/leagueteams?id=' +
              this.props.leagueID,
          );
          const leaders = await res.json();
          this.setState({
            data: leaders,
          });*/
    }

    render() {
        return (
            <Segment basic>
                <Input placeholder="email" onChange={this.handleEmail} /><br/>
                <Input placeholder="password" onChange={this.handlePass1} /><br/>
                <Input placeholder="confirm password" onChange={this.handlePass2} /><br/>
                <Link>
                    <Button onClick={this.onCreateAccount} primary>Create Account</Button>
                </Link>
            </Segment>
        );
    }
};
