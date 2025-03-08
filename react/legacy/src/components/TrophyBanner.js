import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'semantic-ui-react';
import { useTrophyHover } from './TrophyHoverContext';

const TrophyBanner = ({
  title,
  logoSrc,
  textItems = [],
  // Core colors
  mainColor = '#ce1126',
  secondaryColor = '#1e2c56',
  accentColor = '#ffffff',
  // Banner layout
  width = 275,
  // Title styling
  titleFontSize = '2.25rem',
  titleLetterSpacing = '2px',
  titleFontWeight = 'normal',
  // Item styling
  itemFontSize = '1.5rem',
  itemLetterSpacing = '0.75px',
  // Text shadow
  textShadowColor = 'rgba(0, 0, 0, 0.5)',
  textShadowBlur = '3px',
  textShadowOffsetX = '1px',
  textShadowOffsetY = '1px'
}) => {

  const bannerClass = `trophy-banner-${Math.random().toString(36).substr(2, 9)}`;
  const customStyles = `
    .${bannerClass} {
      position: relative;
      display: inline-block;
      vertical-align: top; 
      margin: 20px;
      width: ${width}px; /* width set here for a consistent look */
      min-height: 200px;
      background-color: ${mainColor};
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      padding-bottom: 15px;
    }

    /* Pointed bottom triangle */
    .${bannerClass}::after {
      content: "";
      position: absolute;
      bottom: -30px;
      left: 0;
      width: 0;
      height: 0;
      border-left: ${width / 2}px solid transparent;
      border-right: ${width / 2}px solid transparent;
      border-top: 30px solid ${mainColor};
    }

    /* Title at the top */
    .${bannerClass} .title {
      width: 100%;
      text-align: center;
      color: ${accentColor};
      font-family: 'Anton', sans-serif;
      font-weight: ${titleFontWeight};
      font-size: ${titleFontSize};
      letter-spacing: ${titleLetterSpacing};
      text-transform: uppercase;
      padding: 10px 5px;
      line-height: 1;
      text-shadow: ${textShadowOffsetX} ${textShadowOffsetY} ${textShadowBlur} ${textShadowColor};
    }

    /* Logo container in the middle */
    .${bannerClass} .logo-container {
      width: 100%;
      padding: 10px 0;
      background-color: ${secondaryColor};
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 3px solid ${accentColor};
      border-bottom: 3px solid ${accentColor};
    }

    .${bannerClass} .list-container {
      text-align: center;
      padding: 10px 0;
    }

    .${bannerClass} ol {
      width: 100%;
      list-style-type: none;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .${bannerClass} li {
      color: ${accentColor};
      font-family: 'Anton', sans-serif;
      font-size: ${itemFontSize};
      letter-spacing: ${itemLetterSpacing};
      padding: 5px 20px;
      line-height: 1.2;
      text-align: left;
      width: 100%;
      display: block;
      text-shadow: ${textShadowOffsetX} ${textShadowOffsetY} ${textShadowBlur} ${textShadowColor};
    }
  `;

  return (
    <>
      <style>{customStyles}</style>

      <div className={bannerClass}>
        <div
          className="title"
          // Using dangerouslySetInnerHTML so you can use html tags in the title like <br />
          dangerouslySetInnerHTML={{ __html: title }}
        />
        
        {logoSrc && (
          <div className="logo-container">
            <Image
              src={logoSrc}
              size="tiny"
              style={{ maxWidth: '80%', maxHeight: '60px' }}
            />
          </div>
        )}

        {textItems.length > 0 && (
          <div className="list-container">
            <ol>
              {textItems.map((item, index) => {
                const parts = item.split(' - ');
                if (parts.length !== 2) {
                  return <li key={index}>{item}</li>;
                }
                
                const year = parts[0];
                const name = parts[1];
                const { hoveredName, setHoveredName } = useTrophyHover();
                const isHighlighted = hoveredName === name;
                
                return (
                  <li 
                    key={index}
                    style={{
                      backgroundColor: isHighlighted ? 'rgba(255, 255, 0, 1)' : 'transparent',
                      color: isHighlighted ? 'black' : accentColor,
                      textShadow: isHighlighted ? 'none' : `${textShadowOffsetX} ${textShadowOffsetY} ${textShadowBlur} ${textShadowColor}`,
                      transition: 'background-color 0.3s ease, color 0.3s ease, text-shadow 0.3s ease'
                    }}
                  >
                    {year} - <span 
                      onMouseEnter={() => setHoveredName(name)}
                      onMouseLeave={() => setHoveredName(null)}
                      style={{ 
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textDecorationColor: 'rgba(255, 255, 255, 0.5)',
                        color: isHighlighted ? 'black' : accentColor,
                        transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
                        display: 'inline-block',
                        transition: 'color 0.3s ease, transform 0.3s ease'
                      }}
                    >
                      {name}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </>
  );
};

TrophyBanner.propTypes = {
  title: PropTypes.string.isRequired,
  logoSrc: PropTypes.string,
  textItems: PropTypes.arrayOf(PropTypes.string),
  mainColor: PropTypes.string,
  secondaryColor: PropTypes.string,
  accentColor: PropTypes.string,
  width: PropTypes.number,
  titleFontSize: PropTypes.string,
  titleLetterSpacing: PropTypes.string,
  titleFontWeight: PropTypes.string,
  itemFontSize: PropTypes.string,
  itemLetterSpacing: PropTypes.string,
  textShadowColor: PropTypes.string,
  textShadowBlur: PropTypes.string,
  textShadowOffsetX: PropTypes.string,
  textShadowOffsetY: PropTypes.string
};

export default TrophyBanner;
