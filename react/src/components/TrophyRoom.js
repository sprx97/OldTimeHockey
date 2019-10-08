///* eslint-disable */
import React from 'react';
import { Grid, Image, Header, Segment } from 'semantic-ui-react';

const TrophyRoom = () => {
  return (
    <Segment basic>
      <Grid container centered divided="vertically">
        <Header as="h1">Division 1 Champions</Header>
        <Grid.Row columns={4}>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/D1/2014.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/D1/2015.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/D1/2016.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/D1/2017.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/D1/2018.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/D1/2019.png" />
          </Grid.Column>
        </Grid.Row>

        <Header as="h1">Points For Champions</Header>
        <Grid.Row columns={4}>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/PF/2013.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/PF/2014.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/PF/2015.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/PF/2016.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/PF/2017.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/PF/2018.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/PF/2019.png" />
          </Grid.Column>
        </Grid.Row>

        <Header as="h1">Woppa Cup Champions</Header>
        <Grid.Row columns={4}>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/WC/2013.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/WC/2014.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/WC/2015.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/WC/2016.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/WC/2017.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/WC/2018.png" />
          </Grid.Column>
          <Grid.Column>
            <Image src="http://www.roldtimehockey.com/images/banners/WC/2019.png" />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  );
};

export default TrophyRoom;
