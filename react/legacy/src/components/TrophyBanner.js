import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/TrophyBanner.module.css'
import { useTrophyHover } from './TrophyHoverContext';

const TrophyBanner = ({
  title,
  logoSrc,
  winnersList = [],
  // Core colors
  bannerBackgroundColor = '#ce1126',
  logoBackgroundColor = '#1e2c56',
  logoBackgroundBorderColor = '#ffffff',
  // Banner layout
  width = 300,
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
  const { hoveredName, setHoveredName } = useTrophyHover();

  const inlineStyles = {
    '--banner-background-color': bannerBackgroundColor,
    '--logo-background-color': logoBackgroundColor,
    '--logo-background-border-color': logoBackgroundBorderColor,
    '--title-font-size': titleFontSize,
    '--title-letter-spacing': titleLetterSpacing,
    '--title-font-weight': titleFontWeight,
    '--item-font-size': itemFontSize,
    '--item-letter-spacing': itemLetterSpacing,
    '--text-shadow': `${textShadowOffsetX} ${textShadowOffsetY} ${textShadowBlur} ${textShadowColor}`,
    '--banner-width': `${width}px`,
  };

  return (
    <div className={styles.banner} style={inlineStyles}>
      <div className={styles.title}>
        {title.split(/<br\s*\/?>/).map((part, index, array) => (
          <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
      
      {logoSrc && (
        <div className={styles.logoContainer}>
          <img
            src={logoSrc}
            alt="Trophy logo"
            style={{ 
              width: '90px', 
              height: '100%', 
              objectFit: 'contain',
              borderRadius: '50%' 
            }}
          />
        </div>
      )}

      {winnersList.length > 0 && (
        <div className={styles.listContainer}>
          <ol className={styles.list}>
            {winnersList.map((item, index) => {
              const year = item.year;
              const name = item.name;
              const nameFontSize = item.fontSize;
              
              // Sanitize names by removing special characters before comparison
              const sanitizeName = (str) => str ? str.replace(/[^\w\s]/gi, '') : '';
              const isHighlighted = sanitizeName(hoveredName) === sanitizeName(name);
              
              return (
                <li 
    key={index}
    className={`${styles.listItem} ${isHighlighted ? styles.highlighted : ''}`}
  >
    {year} - <span 
      className={styles.hoverable}
      onMouseEnter={() => setHoveredName(name)}
      onMouseLeave={() => setHoveredName(null)}
      style={{
        // Only dynamic inline style if fontSize needs to be unique per item:
        fontSize: nameFontSize
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
  );
};

TrophyBanner.propTypes = {
  title: PropTypes.string.isRequired,
  logoSrc: PropTypes.string,
  winnersList: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      fontSize: PropTypes.string
    })
  ),
  bannerBackgroundColor: PropTypes.string,
  logoBackgroundColor: PropTypes.string,
  logoBackgroundBorderColor: PropTypes.string,
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
