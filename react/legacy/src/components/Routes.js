import React from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import Standings from './Standings';
import Leaderboard from './Leaderboard';
import TrophyRoom from './TrophyRoom';
import HallOfFame from './HallOfFame';
import ADP from './ADP';
import Login from "./Login";
import CreateAccount from "./CreateAccount";
import NotFound from './NotFound';
import UserProfile from "./UserProfile";
import LeaguePlayoffOdds from "./LeaguePlayoffOdds";

const useQuery = () => new URLSearchParams(useLocation().search);

const Routes = () => {
  const query = useQuery();
  return (
    <Switch>
      <Route exact path="/standings" component={Standings} />
      <Route exact path="/leaderboard" component={Leaderboard} />
      <Route exact path="/trophyroom" component={TrophyRoom} />
      <Route exact path="/halloffame" component={HallOfFame} />
      <Route exact path="/adp" component={ADP} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/createAccount" component={CreateAccount} />
      <Route path="/profile" component={() => (<UserProfile username={query.get('username')}/>)} />
      <Route path="/league/:leagueId" component={LeaguePlayoffOdds} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default Routes;
