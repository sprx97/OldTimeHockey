import React, { useState } from 'react';
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
  textShadowOffsetY = '1px',
}) => {
  const { hoveredName, setHoveredName } = useTrophyHover();
  const [isExpanded, setIsExpanded] = useState(true);

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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle click on title - only toggle on mobile
  const handleTitleClick = (e) => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      toggleExpanded();
    }
  };

  const isDivision1 = title === "Division 1 Champions";
  
  return (
    <div 
      className={`${styles.banner} ${!isExpanded ? styles.collapsed : styles.expanded}`} 
      style={inlineStyles}
      data-division={isDivision1 ? '1' : '0'}
    >
      <div 
        className={styles.title}
        onClick={handleTitleClick}
      >
        {title.split(/<br\s*\/?>/).map((part, index, array) => (
          <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && <br />}
          </React.Fragment>
        ))}
        <span className={styles.accordionIcon}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>
      
      <div className={`${styles.bannerContent} ${!isExpanded ? styles.hidden : ''}`}>
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
                    {year} - 
                    <span 
                      className={styles.hoverable}
                      onMouseEnter={() => setHoveredName(name)}
                      onMouseLeave={() => setHoveredName(null)}
                      style={{
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
  textShadowOffsetY: PropTypes.string,
};

export default TrophyBanner;
