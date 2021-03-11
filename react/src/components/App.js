/* eslint-disable */
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './NavBar';
import Homepage from './Homepage';
import Routes from './Routes';
import ScrollUpButton from './ScrollUpButton';
import ReactGA from 'react-ga';

const trackingId = 'UA-156842946-1';
ReactGA.initialize(trackingId, { testMode: process.env.NODE_ENV === 'test' });

function App() {
  return (
    <Router>
      <NavBar />
      <ScrollUpButton ShowAtPosition={50} />
      <Switch>
        <Route exact path="/" component={Homepage} />
        <Route component={Routes} />
      </Switch>
      <Route
        path="/"
        render={({ location }) => {
          if (typeof window.ga === 'function') {
            window.ga('set', 'page', location.pathname + location.search);
            window.ga('send', 'pageview');
          }
          return null;
        }}
      />
    </Router>
  );
}

export default App;
