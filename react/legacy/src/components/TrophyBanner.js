import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'semantic-ui-react';

const TrophyBanner = ({
  title,
  logoSrc,
  textItems = [],
  // Core colors
  mainColor = '#ce1126',
  secondaryColor = '#1e2c56',
  accentColor = '#ffffff',
  // Banner layout
  width = 225,
  // Title styling
  titleFontSize = '2.25rem',
  titleLetterSpacing = '2px',
  titleFontWeight = 'normal',
  // Item styling
  itemFontSize = '1.25rem',
  itemLetterSpacing = '0.5px'
}) => {
  // Generate a unique class name for this banner instance
  const bannerClass = `trophy-banner-${Math.random().toString(36).substr(2, 9)}`;

  // We’ll use these dynamic values inside a single CSS string
  const customStyles = `
    .${bannerClass} {
      position: relative;
      display: inline-block;
      vertical-align: top; /* helps align multiple banners nicely */
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

    /* List container: center the list itself */
    .${bannerClass} .list-container {
      text-align: center;
      padding: 10px 0;
    }

    /* The list is displayed inline-block to remain left-aligned internally */
    .${bannerClass} ol {
      display: inline-block;
      text-align: left;
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    /* List items: left-aligned text */
    .${bannerClass} li {
      color: ${accentColor};
      font-family: 'Anton', sans-serif;
      font-size: ${itemFontSize};
      letter-spacing: ${itemLetterSpacing};
      padding: 5px 0;
      line-height: 1.2;
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
              {textItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
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
  itemLetterSpacing: PropTypes.string
};

export default TrophyBanner;
