/* eslint-disable */
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Standings from './Standings';
import Leaderboard from './Leaderboard';
import TrophyRoom from './TrophyRoom';
import HallOfFame from './HallOfFame';
import Chat from './Chat';
import NotFound from './NotFound';

const Routes = () => {
  return (
    <section className="container">
      <Switch>
        <Route exact path="/standings" component={Standings} />
        <Route exact path="/leaderboard" component={Leaderboard} />
        <Route exact path="/trophyroom" component={TrophyRoom} />
        <Route exact path="/halloffame" component={HallOfFame} />
        <Route exact path="/chat" component={Chat} />
        <Route component={NotFound} />
      </Switch>
    </section>
  );
};

export default Routes;
