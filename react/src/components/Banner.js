/* eslint-disable */
import React from 'react';
import { Grid, Image, Segment } from 'semantic-ui-react';

const Header = () => (
  <Segment basic>
    <Grid>
      <Grid.Row>
        <Grid.Column width={2}>
          <Image src="/images/alien1.png" alt="alien 1" centered />
        </Grid.Column>
        <Grid.Column width={12}>
          <Image src="/images/banner.png" alt="banner" centered />
        </Grid.Column>
        <Grid.Column width={2}>
          <Image src="/images/alien2.png" alt="alien 2" centered />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
);

export default Header;
