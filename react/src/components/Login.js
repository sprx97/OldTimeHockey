/* eslint-disable */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Segment } from 'semantic-ui-react';

const Login = () => {
  return (
    <Segment basic>
        <Input placeholder="email" /><br/>
        <Input placeholder="password" /><br/>
        <Button primary>Login</Button>
        <Link to="/createAccount">
            <Button secondary>New Account</Button>
        </Link>
    </Segment>
  );
};

export default Login;
