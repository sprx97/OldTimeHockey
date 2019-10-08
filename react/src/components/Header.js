/* eslint-disable */
import React from 'react';
import { Grid, Image, Segment } from 'semantic-ui-react';

const alien1 = 'http://www.roldtimehockey.com/images/logos/alien1.png';
const alien2 = 'http://www.roldtimehockey.com/images/logos/alien2.png';
const banner = 'http://www.roldtimehockey.com/images/logos/banner.png';

const Header = () => (
  <Segment basic>
    <Grid>
      <Grid.Row>
        <Grid.Column width={2}>
          <Image src={alien1} alt="alien 1" centered />
        </Grid.Column>
        <Grid.Column width={12}>
          <Image src={banner} alt="banner" centered />
        </Grid.Column>
        <Grid.Column width={2}>
          <Image src={alien2} alt="alien 2" centered />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
);

export default Header;
