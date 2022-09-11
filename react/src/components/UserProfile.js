import React from 'react';
import { Container, Header } from 'semantic-ui-react';

const UserProfile = ({ username }) => {
  console.log(username);
  return (
    <Container>
      <Header as="h1" textAlign="center" block>
        Future home of {username}'s Profile page
      </Header>
    </Container>
  );
};

export default UserProfile;
