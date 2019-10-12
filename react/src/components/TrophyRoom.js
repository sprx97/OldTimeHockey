///* eslint-disable */
import React from 'react';
import { Container, Grid, Image, Header, Segment } from 'semantic-ui-react';

const TrophyRoom = () => {
  return (
    <Container>
      <Segment basic>
        <Header as="h1" textAlign="center" block>
          Division 1 Champions
        </Header>
        <Grid centered>
          <Grid.Row columns={6}>
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
        </Grid>

        <Header as="h1" textAlign="center" block>
          Points For Champions
        </Header>
        <Grid centered>
          <Grid.Row columns={6}>
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
        </Grid>

        <Header as="h1" textAlign="center" block>
          Woppa Cup Champions
        </Header>
        <Grid centered>
          <Grid.Row columns={6}>
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

          <Grid.Row columns={6}>Last Updated 4/1/19</Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default TrophyRoom;
