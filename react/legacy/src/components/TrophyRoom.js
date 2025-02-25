import React from 'react';
import { Container, Image } from 'semantic-ui-react';
import Banner from './Banner'

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
        <Banner
          name="Playoff Pool Winners"
          topSrc="/images/banners/pp_top.webp"
          middleSrc="/images/banners/pp_middle.webp"
          bottomSrc="/images/banners/pp_bottom.webp"
          text="TestManager\nManager 2"
        />
      </div>
    </Container>
  );
};

export default TrophyRoom;
