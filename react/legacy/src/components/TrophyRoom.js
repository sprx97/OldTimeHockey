import React from 'react';
import { Container, Grid, Image, Segment } from 'semantic-ui-react';

const TrophyRoom = () => {
  return (
    <Container>
      <Segment basic>
        <Image.Group>
          <Image src={"/images/banners/D1_Banner.webp"} />
          <Image src={"/images/banners/PF_Banner.webp"} />
          <Image src={"/images/banners/WC_Banner.webp"} />
          <Image src={"/images/banners/Pres_Banner.webp"} />
          <Image src={"/images/banners/PP_Banner.webp"} />
        </Image.Group>
      </Segment>
    </Container>
  );
};

export default TrophyRoom;
