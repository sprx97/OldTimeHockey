import React from 'react';
import { Container } from 'semantic-ui-react';
import TrophyBanner from './TrophyBanner';

// Global styles for all banners
const globalStyles = {
  width: 225,
  titleTextStyle: {
    fontSize: '1.6rem',
    letterSpacing: '1px',
    fontWeight: 'bold'
  },
  itemTextStyle: {
    fontSize: '0.85rem',
    letterSpacing: '0.5px'
  }
};

const bannerData = [
  {
    id: 'division1',
    title: "Division 1 Champions",
    logoSrc: "/images/jerseys/Gretzky.png",
    textItems: [
      "2024 - GUSZ",
      "2023 - SPRX97",
      "2022 - NODDAN",
      "2021 - BENZENE96",
      "2020 - CHIZZLE*",
      "2019 - CHIZZLE",
      "2018 - SLEEPTALKERZ",
      "2017 - NODDAN",
      "2016 - WOPPA",
      "2015 - TERATIC",
      "2014 - CONCINI"
    ],
    mainColor: "#1e2c56",
    secondaryColor: "#000000"
  },
  {
    id: 'pointsFor',
    title: "Points For Champions",
    logoSrc: "/images/jerseys/Stanley.png",
    textItems: [  
      "2024 - COSTCOSTAN",
      "2023 - CHRISTTHROWSROCKS",
      "2022 - AKACESFAN",
      "2021 - MWHazard",
      "2020 - TOOPROFORYOU",
      "2019 - RUSSTYJ",
      "2018 - SPRX97",
      "2017 - COYLE1096",
      "2016 - WOPPA",
      "2015 - INVISIBLETACO",
      "2014 - TERATIC",
      "2013 - WOPPA"
    ],
    mainColor: "#8a1538",
    secondaryColor: "#000000"
  },
  {
    id: 'woppaCup',
    title: "Woppa Cup Champions",
    logoSrc: "/images/jerseys/Lemieux.png",
    textItems: [  
      "2024 - AKACESFAN",
      "2023 - CHRISTTHROWSROCKS",
      "2022 - PLANKS",
      "2021 - BOBOOMBANG",
      "2020 - SELCIO44",
      "2019 - YAHEARDWPERD",
      "2018 - AKACESFAN",
      "2017 - BOBOOMBANG",
      "2016 - SLEEPTALKERZ",
      "2015 - HKYPLYR",
      "2014 - FCBCN19",
      "2013 - CANNON49"
    ],
    mainColor: "#006847",
    secondaryColor: "#000000"
  },
  {
    id: 'president',
    title: "President's <br /> Trophy",
    logoSrc: "/images/jerseys/Orr.png",
    textItems: [  
      "2024 - BRUINHAWKS",
      "2023 - SPRX97",
      "2022 - TGMILLS",
      "2021 - BOBOOMBANG",
      "2020 - CHIZZLE",
      "2019 - CHIZZLE",
      "2018 - SLEEPTALKERZ",
      "2017 - NODDAN",
      "2016 - WOPPA",
      "2015 - TERATIC",
      "2014 - PEWPEW_PEW"
    ],
    mainColor: "#041e42",
    secondaryColor: "#000000"
  },
  {
    id: 'playoffPool',
    title: "Playoff Pool Champions",
    logoSrc: "/images/jerseys/Howe.png",
    textItems: [
      "2024 - NODDAN",
      "2023 - HAZARD",
      "2022 - TSUNKATSE",
      "2021 - LEAPINLIZ",
      "2020 - TWINSORA",
      "2019 - TOOPROFORYOU",
      "2018 - BOBOOMBANG",
      "2017 - MINNESNOTA"
    ],
    mainColor: "#ce1126",
    secondaryColor: "#000000"
  }
];

const TrophyRoom = () => {
  return (
    <Container fluid>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start', // Align banners at the top
        padding: '40px 0'
      }}>
        {bannerData.map((banner) => (
          <TrophyBanner 
            key={banner.id}
            title={banner.title}
            logoSrc={banner.logoSrc}
            textItems={banner.textItems}
            mainColor={banner.mainColor}
            secondaryColor={banner.secondaryColor}
            width={globalStyles.width}
            titleTextStyle={globalStyles.titleTextStyle}
            itemTextStyle={globalStyles.itemTextStyle}
          />
        ))}
      </div>
    </Container>
  );
};

export default TrophyRoom;
