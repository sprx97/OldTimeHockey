/* eslint-disable */
import React from 'react';
import { Link } from 'react-router-dom';

const UserLink = ({ FFname }) => {
  return (
    <React.Fragment>
      <Link to={`/profile?username=${FFname}`}>
         {FFname}
      </Link>
    </React.Fragment>
  );
};

export default UserLink;
