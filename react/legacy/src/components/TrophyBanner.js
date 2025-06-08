import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/TrophyBanner.module.css'
import { useTrophyHover } from './TrophyHoverContext';
import { useBannerContext } from './TrophyBannerInitializer';

const TrophyBanner = ({
  id,
  title,
  logoSrc,
  winnersList = [],
  // Core colors
  bannerBackgroundColor = '#ce1126',
  logoBackgroundColor = '#1e2c56',
  logoMiddleColor = '#a7d1f0',
  logoBackgroundBorderColor = '#ffffff',
  // Banner layout
  width = 250,
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
  const { expandedBanners, toggleBanner } = useBannerContext();
  const isExpanded = id && expandedBanners.hasOwnProperty(id)
    ? expandedBanners[id]
    : true;

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
    if (id) {
      toggleBanner(id, !isExpanded);
    }
  };

  const handleTitleClick = (e) => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      toggleExpanded();
    }
  };

  return (
    <div
      className={`${styles.banner} ${!isExpanded ? styles.collapsed : styles.expanded}`}
      style={inlineStyles}
      data-banner-id={id}
    >
      <div
        className={`${styles.title} font-fallback`}
        onClick={handleTitleClick}
      >
        {title.split(/<br\s*\/?>/).map((part, index, array) => (
          <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && <br />}
          </React.Fragment>
        ))}
        <span className={styles.accordionIcon}>
          <i className="fas fa-chevron-down"></i>
        </span>
      </div>

      <div className={`${styles.bannerContent} ${!isExpanded ? styles.hidden : ''}`}>
        {logoSrc && (
          <div
            className={styles.logoContainer}
            style={{
              backgroundImage: `linear-gradient(to bottom,
                #2c2e83 0%, #2c2e83 32.5%,
                #ffffff 32.5%, #ffffff 37.5%,
                ${logoMiddleColor} 37.5%, ${logoMiddleColor} 62.5%,
                #ffffff 62.5%, #ffffff 67.5%,
                #2c2e83 67.5%, #2c2e83 100%)`,
              backgroundColor: 'transparent'
            }}
          >
            <img
              src={logoSrc}
              alt="Trophy logo"
              style={{
                width: '100px',
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
                const sanitizeName = (str) => str ? str.split(' ')[0].replace(/[^\w\s]/gi, '') : '';
                const isHighlighted = sanitizeName(hoveredName) === sanitizeName(name);

                return (
                  <li
                    key={index}
                    className={`${styles.listItem} ${isHighlighted ? styles.highlighted : ''} font-fallback`}
                  >
                    {year} - {' '}
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
  id: PropTypes.string,
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
  logoMiddleColor: PropTypes.string,
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
