import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'semantic-ui-react';

const TrophyBanner = ({ 
  title,
  logoSrc,
  textItems = [],
  mainColor = '#ce1126', 
  secondaryColor = '#1e2c56',
  accentColor = '#ffffff',
  width = 200,
  titleTextStyle = {},
  itemTextStyle = {}
}) => {
  // Generate a unique class name for this banner instance
  const bannerClass = `trophy-banner-${Math.random().toString(36).substr(2, 9)}`;
  
  // Base banner style
  const bannerStyle = {
    width: `${width}px`,
    minHeight: '200px', // Minimum height to ensure banner looks good even with minimal content
    margin: '20px',
    position: 'relative',
    display: 'inline-block',
    backgroundColor: mainColor,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    paddingBottom: '15px', // Add padding at the bottom for text content
  };

  // Title style (top of banner)
  const titleStyle = {
    width: '100%',
    textAlign: 'center',
    color: accentColor,
    fontWeight: 'bold',
    fontSize: '1.75rem',
    textTransform: 'uppercase',
    padding: '10px 5px',
    lineHeight: '1',
    fontFamily: 'Anton, sans-serif',
    ...titleTextStyle
  };

  // List container style
  const listContainerStyle = {
    width: '80%', // Width for the list as a whole
    padding: '10px 0',
    margin: '0 auto', // Center the list horizontally
    listStyleType: 'none', // Remove default bullets
  };

  // List item style
  const listItemStyle = {
    textAlign: 'left',
    color: accentColor,
    fontSize: '0.9rem',
    padding: '5px 0',
    lineHeight: '1.2',
    fontFamily: 'Anton, sans-serif',
    ...itemTextStyle
  };

  // Logo container style (middle of banner)
  const logoContainerStyle = {
    width: '100%',
    padding: '10px 0',
    backgroundColor: secondaryColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderTop: `3px solid ${accentColor}`,
    borderBottom: `3px solid ${accentColor}`,
  };

  // CSS for the pointed bottom
  const bannerBottom = `
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
  `;

  return (
    <>
      <style>{bannerBottom}</style>
      <div style={bannerStyle} className={bannerClass}>
        <div style={titleStyle} dangerouslySetInnerHTML={{ __html: title }}></div>
        
        {logoSrc && (
          <div style={logoContainerStyle}>
            <Image src={logoSrc} size="tiny" style={{ maxWidth: '80%', maxHeight: '60px' }} />
          </div>
        )}
        
        {textItems.length > 0 && (
          <ol style={listContainerStyle}>
            {textItems.map((item, index) => (
              <li key={index} style={listItemStyle}>{item}</li>
            ))}
          </ol>
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
  titleTextStyle: PropTypes.object,
  itemTextStyle: PropTypes.object
};

export default TrophyBanner;
