import React from 'react';
import { Container, Grid, Image, Header, Segment } from 'semantic-ui-react';

const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']

const TrophyRoom = () => {
  return (
    <Container>
      <Segment basic>
        <Header as="h1" textAlign="center" block>
          Division 1 Champions
        </Header>
        <Grid centered>
          <Grid.Row columns={4}>
            {years.map(year => (
              <Grid.Column>
                {
                  (year === "2013") ? <div><br/><br/><br/><br/><br/><br/><br/><br/><b>2013 Inaugural Season. No tiers yet!</b></div> : <Image src={"/images/banners/D1/" + year + ".png"} alt={"Division 1 champion " + year} />
                }
                {
                  (year === "2020") ? "*Regular Season Champion, Playoffs Cancelled Due To Shortened Season" : ""
                }
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>

        <Header as="h1" textAlign="center" block>
          Points For Champions
        </Header>
        <Grid centered>
          <Grid.Row columns={4}>
            {years.map(year => (
              <Grid.Column>
                {
                  <Image src={"/images/banners/PF/" + year + ".png"} alt={"Points for champion " + year} />
                }
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>

        <Header as="h1" textAlign="center" block>
          Woppa Cup Champions
        </Header>
        <Grid centered>
          <Grid.Row columns={4}>
            {years.map(year => (
              <Grid.Column>
                {
                  <Image src={"/images/banners/WC/" + year + ".png"} alt={"Woppa cup champion " + year} />
                }
              </Grid.Column>
            ))}
          </Grid.Row>
          <Grid.Row columns={4}>Last Updated 6/6/22</Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default TrophyRoom;
