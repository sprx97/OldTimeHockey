/* eslint-disable */
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './NavBar';
import Homepage from './Homepage';
import Routes from './Routes';
import ScrollUpButton from './ScrollUpButton';
import ReactGA from 'react-ga';

const trackingId = "UA-156842946-1";
ReactGA.initialize(trackingId);
ReactGA.set({
  // any data that is relevant to the user session
  // that you would like to track with google analytics
})

function App() {
  return (
    <Router>
      <NavBar />
      <ScrollUpButton ShowAtPosition={50} />
      <Switch>
        <Route exact path="/" component={Homepage} />
        <Route component={Routes} />
      </Switch>
    </Router>
  );
}

export default App;
