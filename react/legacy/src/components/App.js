import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ReactGA from 'react-ga';

import Homepage from './Homepage';
import NavBar from './NavBar';
import Routes from './Routes';
import Updating from './Updating';

const trackingId = 'UA-156842946-1';
ReactGA.initialize(trackingId, { testMode: process.env.NODE_ENV === 'test' });

function App() {
  const [sentinel, setSentinel] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/node/v2/Sentinel");
        if (!res.ok) setSentinel(false);
        const data = await res.json();
        setSentinel(data.sentinel);
      }
      catch {
        setSentinel(false);
      }
    })();
  }, []);

  if (sentinel === null) return;
  if (sentinel) {
    return (
      <Updating />
    );
  }
  
  return (
    <Router>
      <NavBar />
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
