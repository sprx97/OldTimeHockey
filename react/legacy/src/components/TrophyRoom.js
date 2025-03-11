import React from 'react';
import { Container } from 'semantic-ui-react';
import TrophyBanner from './TrophyBanner';
import raftersBackground from '../assets/rafters.jpg';
import { TrophyHoverProvider } from './TrophyHoverContext';
import TrophyBannerInitializer from './TrophyBannerInitializer';

const bannerData = [
  {
    id: 'division1',
    title: "Division 1 Champions",
    logoSrc: "/images/logos/oth-circular.gif",
    winnersList: [
      { year: "2024", name: "GUSZ" },
      { year: "2023", name: "SPRX97" },
      { year: "2022", name: "NODDAN" },
      { year: "2021", name: "BENZENE96" },
      { year: "2020", name: "CHIZZLE*" },
      { year: "2019", name: "CHIZZLE" },
      { year: "2018", name: "SLEEPTALKERZ" },
      { year: "2017", name: "NODDAN" },
      { year: "2016", name: "WOPPA" },
      { year: "2015", name: "TERATIC" },
      { year: "2014", name: "CONCINI" }
    ],
    bannerBackgroundColor: "#2c2e83",
    logoMiddleColor: "#a7d1f0"
  },
  {
    id: 'pointsFor',
    title: "Points For Champions",
    logoSrc: "/images/logos/oth-circular.gif",
    winnersList: [  
      { year: "2024", name: "COSTCOSTAN" },
      /* For users with long usernames like Chris that break lines where we don't want them to I've included granular font size controls */
      { year: "2023", name: "CHRISTHROWSROCKS", fontSize: "1.15rem" }, 
      { year: "2022", name: "AKACESFAN" },
      { year: "2021", name: "MWHazard" },
      { year: "2020", name: "TOOPROFORYOU" },
      { year: "2019", name: "RUSSTYJ" },
      { year: "2018", name: "SPRX97" },
      { year: "2017", name: "COYLE1096" },
      { year: "2016", name: "WOPPA" },
      { year: "2015", name: "INVISIBLETACO" },
      { year: "2014", name: "TERATIC" },
      { year: "2013", name: "WOPPA"}
    ],
    bannerBackgroundColor: "#2c2e83",
    logoMiddleColor: "#ffcc00"
  },
  {
    id: 'woppaCup',
    title: "Woppa Cup Champions",
    logoSrc: "/images/logos/oth-circular.gif",
    winnersList: [  
      { year: "2024", name: "AKACESFAN" },
      { year: "2023", name: "CHRISTHROWSROCKS", fontSize: "1.15rem"},
      { year: "2022", name: "PLANKS" },
      { year: "2021", name: "BOBOOMBANG" },
      { year: "2020", name: "SELCIO44" },
      { year: "2019", name: "YAHEARDWPERD" },
      { year: "2018", name: "AKACESFAN" },
      { year: "2017", name: "BOBOOMBANG" },
      { year: "2016", name: "SLEEPTALKERZ" },
      { year: "2015", name: "HKYPLYR" },
      { year: "2014", name: "FCBCN19" },
      { year: "2013", name: "CANNON49" }
    ],
    bannerBackgroundColor: "#2c2e83",
    logoMiddleColor: "#ff6b6b"
  },
  {
    id: 'president',
    title: "President's <br /> Trophy",
    logoSrc: "/images/logos/oth-circular.gif",
    winnersList: [  
      { year: "2024", name: "BRUINHAWKS" },
      { year: "2023", name: "SPRX97" },
      { year: "2022", name: "TGMILLS" },
      { year: "2021", name: "BOBOOMBANG" },
      { year: "2020", name: "CHIZZLE" },
      { year: "2019", name: "CHIZZLE" },
      { year: "2018", name: "SLEEPTALKERZ" },
      { year: "2017", name: "NODDAN" },
      { year: "2016", name: "WOPPA" },
      { year: "2015", name: "TERATIC" },
      { year: "2014", name: "PEWPEW_PEW" }
    ],
    bannerBackgroundColor: "#2c2e83",
    logoMiddleColor: "#4caf50"
  },
  {
    id: 'playoffPool',
    title: "Playoff Pool Champions",
    logoSrc: "/images/logos/oth-circular.gif",
    winnersList: [
      { year: "2024", name: "NODDAN" },
      { year: "2023", name: "HAZARD" },
      { year: "2022", name: "TSUNKATSE" },
      { year: "2021", name: "LEAPINLIZ" },
      { year: "2020", name: "TWINSORA" },
      { year: "2019", name: "TOOPROFORYOU" },
      { year: "2018", name: "BOBOOMBANG" },
      { year: "2017", name: "MINNESNOTA" }
    ],
    bannerBackgroundColor: "#2c2e83",
    logoMiddleColor: "#9c27b0"
  }
];

const TrophyRoom = () => {
  return (
    <TrophyHoverProvider>
      <TrophyBannerInitializer />
      <Container fluid style={{
        backgroundImage: `url(${raftersBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          zIndex: 1
        }}></div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '40px 0',
            position: 'relative',
            zIndex: 2
          }}
        >
          {bannerData.map((banner) => (
            <TrophyBanner 
              key={banner.id}
              title={banner.title}
              logoSrc={banner.logoSrc}
              winnersList={banner.winnersList}
              bannerBackgroundColor={banner.bannerBackgroundColor}
              logoMiddleColor={banner.logoMiddleColor}
            />
          ))}
        </div>
      </Container>
    </TrophyHoverProvider>
  );
};

export default TrophyRoom;
