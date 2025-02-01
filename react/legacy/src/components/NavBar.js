import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import config from './config.json';
import logo from '../oth-wordmark-white.svg';
import './NavBar.css';

export default class NavBar extends Component {
  state = { 
    activeItem: location.pathname,
    isMobileMenuOpen: false
  };

  handleItemClick = (name) => {
    this.setState({ 
      activeItem: name,
      isMobileMenuOpen: false 
    });
  };

  toggleMobileMenu = () => {
    this.setState(prevState => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen
    }));
  };

  render() {
    const { activeItem } = this.state;

    return (
      <Fragment>
        <div className="navbar-container">
          <Link to="/" onClick={() => this.handleItemClick('/')} className="navbar-brand">
            <img src={logo} alt="OTH" className="navbar-logo" />
          </Link>
          <button 
            className={`menu-toggle ${this.state.isMobileMenuOpen ? 'open' : ''}`} 
            onClick={this.toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <Menu
            id="main-menu"
            className={`navbar-menu ${this.state.isMobileMenuOpen ? 'mobile-open' : ''}`}
            style={{ flexGrow: '1' }}
            size="large"
            inverted
            stackable
            attached
            compact
          >
            <Menu.Item
              as={Link}
              to="/standings"
              name="standings"
              active={activeItem === '/standings'}
              onClick={() => this.handleItemClick('/standings')}
            >
              Standings
            </Menu.Item>
            <Menu.Item
              as={Link}
              to="/leaderboard"
              name="leaderboard"
              active={activeItem === '/leaderboard'}
              onClick={() => this.handleItemClick('/leaderboard')}
            >
              Leaderboard
            </Menu.Item>
            <Menu.Item
              as={Link}
              to="/adp"
              name="ADP"
              active={activeItem === '/adp'}
              onClick={() => this.handleItemClick('/adp')}
            >
              ADP
            </Menu.Item>
            <Menu.Item
              as={Link}
              to="/trophyroom"
              name="trophyRoom"
              active={activeItem === '/trophyroom'}
              onClick={() => this.handleItemClick('/trophyroom')}
            >
              Trophy Room
            </Menu.Item>
            <Menu.Item
              as={Link}
              to="/halloffame"
              name="hallOfFame"
              active={activeItem === '/halloffame'}
              onClick={() => this.handleItemClick('/halloffame')}
            >
              Hall of Fame
            </Menu.Item>
            <Menu.Item
              as="a"
              href="https://discord.com/invite/zXTUtj9"
              target="_blank"
              rel="noopener noreferrer"
              name="chat"
              onClick={() => this.handleItemClick('/chat')}
            >
              <i className="fab fa-discord" aria-label="Join Discord Server"></i>
            </Menu.Item>
          </Menu>
          {config.features.enableLogin && (
            <Menu
              style={{ width: 'fit-content' }}
              size="large"
              inverted
              stackable
              attached
              compact
            >
              <Menu.Item
                as={Link}
                to="/login"
                name="login"
                active={activeItem === '/login'}
                onClick={() => this.handleItemClick('/login')}
              >
                Login/Register
              </Menu.Item>
            </Menu>
          )}
        </div>
      </Fragment>
    );
  }
}
