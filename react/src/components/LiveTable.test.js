/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import LiveTable from './LiveTable';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<LiveTable />, div);
  ReactDOM.unmountComponentAtNode(div);
});
