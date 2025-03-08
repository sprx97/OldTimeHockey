import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'semantic-ui-react';

const TrophyBanner = ({ 
  title,
  subtitle,
  logoSrc,
  year,
  mainColor = '#ce1126', // Red like in the example
  secondaryColor = '#1e2c56', // Navy blue
  accentColor = '#ffffff', // White
  width = 200,
  height = 300
}) => {
  // Generate a unique class name for this banner instance
  const bannerClass = `trophy-banner-${Math.random().toString(36).substr(2, 9)}`;
  
  // Base banner style
  const bannerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    margin: '20px',
    position: 'relative',
    display: 'inline-block',
    backgroundColor: mainColor,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  };

  // Title style (top of banner)
  const titleStyle = {
    width: '100%',
    textAlign: 'center',
    color: accentColor,
    fontWeight: 'bold',
    fontSize: '1.2rem',
    textTransform: 'uppercase',
    padding: '10px 5px',
    lineHeight: '1.2',
  };

  // Subtitle style (optional)
  const subtitleStyle = {
    width: '100%',
    textAlign: 'center',
    color: accentColor,
    fontWeight: 'bold',
    fontSize: '1rem',
    textTransform: 'uppercase',
    padding: '0 5px 10px',
    lineHeight: '1.2',
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

  // Year style (bottom of banner)
  const yearStyle = {
    width: '100%',
    textAlign: 'center',
    color: accentColor,
    fontWeight: 'bold',
    fontSize: '1.5rem',
    padding: '15px 5px',
  };

  // CSS for the pointed bottom
  const cssRules = `
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
      <style>{cssRules}</style>
      <div style={bannerStyle} className={bannerClass}>
        <div style={titleStyle}>{title}</div>
        {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
        
        {logoSrc && (
          <div style={logoContainerStyle}>
            <Image src={logoSrc} size="tiny" style={{ maxWidth: '80%', maxHeight: '60px' }} />
          </div>
        )}
        
        {year && <div style={yearStyle}>{year}</div>}
      </div>
    </>
  );
};

TrophyBanner.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  logoSrc: PropTypes.string,
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  mainColor: PropTypes.string,
  secondaryColor: PropTypes.string,
  accentColor: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number
};

export default TrophyBanner;
