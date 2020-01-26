/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

export default class NavBar extends Component {
  state = { activeItem: location.pathname }

  handleItemClick = name => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;

    return (
      // Probably should wrap this all in a hamburger button at mobile resolutions...
      <Menu size="large" inverted stackable attached>
        <Link to="/" onClick={() => this.handleItemClick('/')}>
          <Menu.Item name="home" active={activeItem === '/'} link={false}>
            Home
          </Menu.Item>
        </Link>
        <Link to="/standings" onClick={() => this.handleItemClick('/standings')}>
          <Menu.Item
            name="standings"
            active={activeItem === '/standings'}
            link={false}
          >
            Standings
          </Menu.Item>
        </Link>
        <Link
          to="/leaderboard"
          onClick={() => this.handleItemClick('/leaderboard')}
        >
          <Menu.Item
            name="leaderboard"
            active={activeItem === '/leaderboard'}
            link={false}
          >
            Leaderboard
          </Menu.Item>
        </Link>
        <Link
          to="/trophyroom"
          onClick={() => this.handleItemClick('/trophyroom')}
        >
          <Menu.Item
            name="trophyRoom"
            active={activeItem === '/trophyroom'}
            link={false}
          >
            Trophy Room
          </Menu.Item>
        </Link>
        <Link
          to="/halloffame"
          onClick={() => this.handleItemClick('/halloffame')}
        >
          <Menu.Item
            name="hallOfFame"
            active={activeItem === '/halloffame'}
            link={false}
          >
            Hall of Fame
          </Menu.Item>
        </Link>
        <Link to="/chat" onClick={() => this.handleItemClick('/chat')}>
          <Menu.Item name="chat" active={activeItem === '/chat'} link={false}>
            Chat
          </Menu.Item>
        </Link>
      </Menu>
    );
  }
}
