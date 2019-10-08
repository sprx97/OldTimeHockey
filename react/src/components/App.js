/* eslint-disable */
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import NavBar from './NavBar';
import Homepage from './Homepage';
import Routes from './Routes';

function App() {
  return (
    <Router>
      <Container fluid>
        <NavBar />
        <Switch>
          <Route exact path="/" component={Homepage} />
          <Route component={Routes} />
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
