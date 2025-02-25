


import React from "react";

const Banner = ({ name, topSrc, middleSrc, bottomSrc, text }) => {
  return (
    <div>
      {/* Top section */}
      <div style={{margin: "0"}}>
        <img src={topSrc} alt={name} />
      </div>

      {/* Middle section with text */}
      <div>
        <img src={middleSrc} alt={name} />
      </div>

      {/* Bottom section */}
      <div>
        <img src={bottomSrc} alt={name} />
      </div>
    </div>
  );
};

export default Banner;
