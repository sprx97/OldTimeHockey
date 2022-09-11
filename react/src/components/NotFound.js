import React from 'react';
import { Segment } from 'semantic-ui-react';

const NotFound = () => {
  return (
    <Segment basic textAlign="center" size="massive" padded="very">
      <h1 className="x-large text-primary">
        <i className="fas fa-exclamation-triangle" /> Page Not Found
      </h1>
      <p className="large">Sorry, this page does not exist.</p>
      <img src="images/404.gif" />
    </Segment>
  );
};

export default NotFound;
