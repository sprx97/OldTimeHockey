import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Header, Input, Segment } from 'semantic-ui-react';

const Login = () => {
  return (
    <Segment basic>
        <Input placeholder="email" type="email"/><br/>
        <Input placeholder="password" type="password"/><br/>
        <Button primary>Login</Button>
        <Link to="/createAccount">
            <Button secondary>New Account</Button>
        </Link>
        <Header as="h3" color="red">This feature is not finished yet. Don't expect these buttons to do anything.</Header>
    </Segment>
  );
};

export default Login;
