/* eslint-disable */
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './NavBar';
import Homepage from './Homepage';
import Routes from './Routes';
import ScrollUpButton from './ScrollUpButton';

export const divisionMapping = {
  "Gretzky":"d1",
  "Eastern":"d2",
  "Western":"d2",
  "Roy":"d2",
  "Hasek":"d2",
  "Brodeur":"d2",
  "Price-Murray":"d2",
  "Jones-Allen":"d2",
  "Howe":"d3",
  "Lemieux":"d3",
  "Dionne":"d3",
  "Francis":"d3",
  "Yzerman":"d3",
  "Jagr":"d3",
  "Messier":"d3",
  "Sakic":"d3",
  "Esposito":"d4",
  "Recchi":"d4",
  "Coffey":"d4",
  "Bourque":"d4",
  "Pronger":"d4",
  "Lidstrom":"d4",
  "Chelios":"d4",
  "Orr":"d4",
  "Leetch":"d4",
  "Niedermayer":"d4",
};

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
