import React from 'react';
import { Container } from 'semantic-ui-react';
import TrophyBanner from './TrophyBanner';

const TrophyRoom = () => {
  return (
    <Container fluid>
      <div style={{textAlign: 'center', padding: '40px 0'}}>
        <TrophyBanner 
          title="Division 1" 
          subtitle="Champion"
          logoSrc="/images/jerseys/Gretzky.png"
          year="2023"
          mainColor="#1e2c56" 
          secondaryColor="#000000"
          width={180} 
          height={300}
        />
        <TrophyBanner 
          title="Playoff" 
          subtitle="Finals"
          logoSrc="/images/jerseys/Stanley.png"
          year="2023"
          mainColor="#8a1538" 
          secondaryColor="#000000"
          width={180} 
          height={300}
        />
        <TrophyBanner 
          title="Wildcard" 
          subtitle="Champion"
          logoSrc="/images/jerseys/Lemieux.png"
          year="2023"
          mainColor="#006847" 
          secondaryColor="#000000"
          width={180} 
          height={300}
        />
        <TrophyBanner 
          title="President's" 
          subtitle="Trophy"
          logoSrc="/images/jerseys/Orr.png"
          year="2023"
          mainColor="#041e42" 
          secondaryColor="#000000"
          width={180} 
          height={300}
        />
        <TrophyBanner 
          title="Playoff" 
          subtitle="Performance"
          logoSrc="/images/jerseys/Howe.png"
          year="2023"
          mainColor="#ce1126" 
          secondaryColor="#000000"
          width={180} 
          height={300}
        />
      </div>
    </Container>
  );
};

export default TrophyRoom;
