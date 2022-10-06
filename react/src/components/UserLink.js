import React from 'react';
import { Link } from 'react-router-dom';

const UserLink = ({ FFname }) => {
  return (
    <React.Fragment>
      { FFname === "Take Over" ? ('') :
      (<Link to={`/profile?username=${FFname}`}>
         {FFname}
      </Link>)}
    </React.Fragment>
  );
};

export default UserLink;
