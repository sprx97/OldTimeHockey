import React from 'react';
import { Container, Image } from 'semantic-ui-react';

const TrophyRoom = () => {
  return (
    <Container fluid>
      <div style={{textAlign: 'center'}}>
        <Image.Group>
          <Image src={"/images/banners/D1_Banner.webp"} />
          <Image src={"/images/banners/PF_Banner.webp"} />
          <Image src={"/images/banners/WC_Banner.webp"} />
          <Image src={"/images/banners/Pres_Banner.webp"} />
          <Image src={"/images/banners/PP_Banner.webp"} />
        </Image.Group>
      </div>
    </Container>
  );
};

export default TrophyRoom;
