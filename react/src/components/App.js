/* eslint-disable */
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './NavBar';
import Homepage from './Homepage';
import Routes from './Routes';
import ScrollUpButton from './ScrollUpButton';

export const divisionMapping = {
  "Gretzky":"D1",
  "Eastern":"D2",
  "Western":"D2",
  "Roy":"D2",
  "Hasek":"D2",
  "Brodeur":"D2",
  "Price-Murray":"D2",
  "Jones-Allen":"D2",
  "Howe":"D3",
  "Lemieux":"D3",
  "Dionne":"D3",
  "Francis":"D3",
  "Yzerman":"D3",
  "Jagr":"D3",
  "Messier":"D3",
  "Sakic":"D3",
  "Esposito":"D4",
  "Recchi":"D4",
  "Coffey":"D4",
  "Bourque":"D4",
  "Pronger":"D4",
  "Lidstrom":"D4",
  "Chelios":"D4",
  "Orr":"D4",
  "Leetch":"D4",
  "Niedermayer":"D4",
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
