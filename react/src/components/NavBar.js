/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

export default class NavBar extends Component {
  state = {};

  handleItemClick = name => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;

    return (
      <Menu size="large" inverted attached>
        <Link to="/" onClick={() => this.handleItemClick('home')}>
          <Menu.Item name="home" active={activeItem === 'home'} link={false}>
            Home
          </Menu.Item>
        </Link>
        <Link to="/standings" onClick={() => this.handleItemClick('standings')}>
          <Menu.Item
            name="standings"
            active={activeItem === 'standings'}
            link={false}
          >
            Standings
          </Menu.Item>
        </Link>
        <Link
          to="/leaderboard"
          onClick={() => this.handleItemClick('leaderboard')}
        >
          <Menu.Item
            name="leaderboard"
            active={activeItem === 'leaderboard'}
            link={false}
          >
            Leaderboard
          </Menu.Item>
        </Link>
        <Link
          to="/trophyroom"
          onClick={() => this.handleItemClick('trophyRoom')}
        >
          <Menu.Item
            name="trophyRoom"
            active={activeItem === 'trophyRoom'}
            link={false}
          >
            Tropy Room
          </Menu.Item>
        </Link>
        <Link
          to="/halloffame"
          onClick={() => this.handleItemClick('hallOfFame')}
        >
          <Menu.Item
            name="hallOfFame"
            active={activeItem === 'hallOfFame'}
            link={false}
          >
            Hall of Fame
          </Menu.Item>
        </Link>
        <Link to="/chat" onClick={() => this.handleItemClick('chat')}>
          <Menu.Item name="chat" active={activeItem === 'chat'} link={false}>
            Chat
          </Menu.Item>
        </Link>
      </Menu>
    );
  }
}
