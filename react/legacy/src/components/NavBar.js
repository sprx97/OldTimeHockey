import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Menu, Message } from 'semantic-ui-react';
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
      <>
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
              as="a"
              href="https://public.tableau.com/app/profile/daniel.cairns/viz/OTHELO/ELORanking2025"
              target="_blank"
              rel="noopener noreferrer"
              name="elo"
              onClick={() => this.handleItemClick('/elo')}
            >
              Elo
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
              href="https://oth-playoff-pool.replit.app/"
              target="_blank"
              rel="noopener noreferrer"
              name="playoffpool"
              onClick={() => this.handleItemClick('/playoffpool')}
            >
              Playoff Pool
            </Menu.Item>
            <Menu.Item
              as="a"
              href="https://discord.com/invite/zXTUtj9"
              target="_blank"
              rel="noopener noreferrer"
              name="chat"
              onClick={() => this.handleItemClick('/chat')}
            >
              <i className="fab fa-discord" aria-label="Join Discord Server" style={{marginRight: 6}}></i>
              Discord
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
        {/* <Message warning style={{ margin: 0, borderRadius: 0 }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Icon name="warning circle" />
            <Message.Content style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Message.Header>Site Issues 4/6/2026</Message.Header>
              <span>
                We're currently experiencing issues with Fleaflicker data. Scores/standings are not up-to-date.
              </span>
            </Message.Content>
          </div>
        </Message> */}
      </>
    );
  }
}
