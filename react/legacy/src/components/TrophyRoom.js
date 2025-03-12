import React from 'react';
import { Container } from 'semantic-ui-react';
import TrophyBanner from './TrophyBanner';
import raftersBackground from '../assets/rafters.jpg';
import { TrophyHoverProvider } from './TrophyHoverContext';
import TrophyBannerInitializer, { BannerProvider } from './TrophyBannerInitializer';

const bannerData = [
  {
    id: 'division1',
    title: "Division 1 Champions",
    logoSrc: "/images/logos/oth-circle-logo.svg",
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
    logoMiddleColor: "#ffc700"
  },
  {
    id: 'pointsFor',
    title: "Points For Champions",
    logoSrc: "/images/logos/oth-circle-logo.svg",
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
    logoMiddleColor: "#ff0000"
  },
  {
    id: 'woppaCup',
    title: "Woppa Cup Champions",
    logoSrc: "/images/logos/oth-circle-logo.svg",
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
    logoMiddleColor: "#109936"
  },
  {
    id: 'president',
    title: "Presidents' <br /> Trophy",
    logoSrc: "/images/logos/oth-circle-logo.svg",
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
    logoMiddleColor: "#00f0ff"
  },
  {
    id: 'playoffPool',
    title: "Playoff Pool Champions",
    logoSrc: "/images/logos/oth-circle-logo.svg",
    winnersList: [
      { year: "2024", name: "NODDAN" },
      { year: "2023", name: "HAZARD" },
      { year: "2022", name: "TSUNKATSE" },
      { year: "2021", name: "LEAPINLIZ" },
      { year: "2020", name: "TWINSORA" },
      { year: "2019", name: "TOOPROFORYOU" },
      { year: "2018", name: "BOBOOMBANG" },
    ],
    bannerBackgroundColor: "#2c2e83",
    logoMiddleColor: "#ff6b00"
  }
];

const TrophyRoom = () => {
  return (
    <TrophyHoverProvider>
      <BannerProvider>
        <TrophyBannerInitializer />
        {/* 
        * Add a style tag with the highest specificity possible to combat semantic ui's brute forced gutters 
        * This is a brute force response, but the key here is we're keeping the scope of the change limited
        * to the trophy room. Otherwise global changes would be necessary and that kind of refactor isn't
        * worth the headache atm. This works in conjuction with TrophyRoom.css
        */}
        <style>
          {`
            @media only screen and (max-width: 767px) {
              .ui.container.fluid.trophy-room-container,
              .ui.fluid.container.trophy-room-container {
                margin-left: 0 !important;
                margin-right: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
              }
            }
          `}
        </style>
      <Container 
        fluid 
        className="trophy-room-container" 
        style={{
          backgroundImage: `url(${raftersBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        }}
      >
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
              id={banner.id}
              title={banner.title}
              logoSrc={banner.logoSrc}
              winnersList={banner.winnersList}
              bannerBackgroundColor={banner.bannerBackgroundColor}
              logoMiddleColor={banner.logoMiddleColor}
            />
          ))}
        </div>
      </Container>
      </BannerProvider>
    </TrophyHoverProvider>
  );
};

export default TrophyRoom;
