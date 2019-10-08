/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

export default class NavBar extends Component {
  state = {};

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;

    return (
      <Menu size="large" inverted attached>
        <Link to="/">
          <Menu.Item
            name="home"
            active={activeItem === 'home'}
            onClick={this.handleItemClick}
          >
            Home
          </Menu.Item>
        </Link>
        <Link to="/standings">
          <Menu.Item
            name="standings"
            active={activeItem === 'standings'}
            onClick={this.handleItemClick}
          >
            Standings
          </Menu.Item>
        </Link>
        <Link to="/leaderboard">
          <Menu.Item
            name="leaderboard"
            active={activeItem === 'leaderboard'}
            onClick={this.handleItemClick}
          >
            Leaderboard
          </Menu.Item>
        </Link>
        <Link to="/trophyroom">
          <Menu.Item
            name="trophyoom"
            active={activeItem === 'trophyRoom'}
            onClick={this.handleItemClick}
          >
            Tropy Room
          </Menu.Item>
        </Link>
        <Link to="/halloffame">
          <Menu.Item
            name="hallOfFame"
            active={activeItem === 'hallOfFame'}
            onClick={this.handleItemClick}
          >
            Hall of Fame
          </Menu.Item>
        </Link>
        <Link to="/chat">
          <Menu.Item
            name="chat"
            active={activeItem === 'chat'}
            onClick={this.handleItemClick}
          >
            Chat
          </Menu.Item>
        </Link>
      </Menu>
    );
  }
}
