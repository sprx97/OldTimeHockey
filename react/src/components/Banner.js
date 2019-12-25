/* eslint-disable */
import React from 'react';
import { Grid, Image, Segment } from 'semantic-ui-react';

const Header = () => (
  <Segment basic>
    <Grid centered>
      <Grid.Row columns={3}>
        <Grid.Column width={3}>
          <Image src="/images/logos/alien1.png" alt="alien 1" centered />
        </Grid.Column>
        <Grid.Column width={10}>
          <Image src="/images/logos/banner.png" alt="banner" centered />
        </Grid.Column>
        <Grid.Column width={3}>
          <Image src="/images/logos/alien2.png" alt="alien 2" centered />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
);

export default Header;
