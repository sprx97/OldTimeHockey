import React from 'react';
import { Image } from 'semantic-ui-react';
import "../styles/App.css"

const year = "2022";

const Header = () => (
  <div alt="Banner" style={{width:"100%", height:"200px", backgroundImage:"url('/images/logos/banner.png')", backgroundRepeat:"no-repeat", backgroundPosition:"center top", overflow:"hidden"}}>
    <div centered style={{height:"160px", minWidth:"300px", left:"calc(50% + 200px)", top:"20px", position:"relative"}}>
      <Image src={"/images/banners/D1/" + year + ".png"} alt="D1 Champion" style={{height:"100%", display:"inline-block"}}/>
      <Image src={"/images/banners/PF/" + year + ".png"} alt="Points For Champion" style={{height:"100%", paddingLeft:"20px", display:"inline-block"}}/>
      <Image src={"/images/banners/WC/" + year + ".png"} alt="Woppa Cup Champion" style={{height:"100%", paddingLeft:"20px", display:"inline-block"}}/>
    </div>
  </div>
);

export default Header;
