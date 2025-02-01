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
            <Link
              to="/standings"
              onClick={() => this.handleItemClick('/standings')}
            >
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
            <Link to="/adp" onClick={() => this.handleItemClick('/adp')}>
              <Menu.Item name="ADP" active={activeItem === '/adp'} link={false}>
                ADP
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
            <a href="https://discord.com/invite/zXTUtj9" target="_blank" rel="noopener noreferrer">
              <Menu.Item
                name="chat"
                active={activeItem === '/chat'}
                link={false}
              >
                <i className="fab fa-discord" aria-label="Join Discord Server"></i>
              </Menu.Item>
            </a>
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
              <Link to="/login" onClick={() => this.handleItemClick('/login')}>
                <Menu.Item
                  name="login"
                  active={activeItem === '/login'}
                  link={false}
                >
                  Login/Register
                </Menu.Item>
              </Link>
            </Menu>
          )}
        </div>
      </Fragment>
    );
  }
}
