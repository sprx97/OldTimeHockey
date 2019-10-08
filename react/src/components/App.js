/* eslint-disable */
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './NavBar';
import Homepage from './Homepage';
import Routes from './Routes';
import ScrollUpButton from './ScrollUpButton';

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
