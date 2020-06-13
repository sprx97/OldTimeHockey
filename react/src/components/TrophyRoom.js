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
          <Grid.Row columns={4}>
            <Grid.Column>
              <Image
                src="/images/banners/D1/2014.png"
                alt="division 1 champion 2014"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/D1/2015.png"
                alt="division 1 champion 2015"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/D1/2016.png"
                alt="division 1 champion 2016"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/D1/2017.png"
                alt="division 1 champion 2017"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/D1/2018.png"
                alt="division 1 champion 2018"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/D1/2019.png"
                alt="division 1 champion 2019"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/D1/2020.png"
                alt="division 1 champion 2020"
              />
              *Regular Season Champion, Playoffs Cancelled Due To Shortened Season
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Header as="h1" textAlign="center" block>
          Points For Champions
        </Header>
        <Grid centered>
          <Grid.Row columns={4}>
            <Grid.Column>
              <Image
                src="/images/banners/PF/2013.png"
                alt="points for champion 2013"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/PF/2014.png"
                alt="points for champion 2014"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/PF/2015.png"
                alt="points for champion 2015"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/PF/2016.png"
                alt="points for champion 2016"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/PF/2017.png"
                alt="points for champion 2017"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/PF/2018.png"
                alt="points for champion 2018"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/PF/2019.png"
                alt="points for champion 2019"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/PF/2020.png"
                alt="points for champion 2020"
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Header as="h1" textAlign="center" block>
          Woppa Cup Champions
        </Header>
        <Grid centered>
          <Grid.Row columns={4}>
            <Grid.Column>
              <Image
                src="/images/banners/WC/2013.png"
                alt="woppa cup champion 2013"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/WC/2014.png"
                alt="woppa cup champion 2014"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/WC/2015.png"
                alt="woppa cup champion 2015"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/WC/2016.png"
                alt="woppa cup champion 2016"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/WC/2017.png"
                alt="woppa cup champion 2017"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/WC/2018.png"
                alt="woppa cup champion 2018"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/WC/2019.png"
                alt="woppa cup champion 2019"
              />
            </Grid.Column>
            <Grid.Column>
              <Image
                src="/images/banners/WC/2020.png"
                alt="woppa cup champion 2020"
              />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row columns={4}>Last Updated 6/13/20</Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default TrophyRoom;
