import { useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { TEAM_LOGOS } from '@/constants/teamLogos'
import whiteLogo from '@/assets/logos/oth-wordmark-white.svg'
import blackLogo from '@/assets/logos/oth-wordmark-black.svg'

export const useNavigationStyles = () => {
  const { theme, colors } = useTheme()

  return useMemo(() => {
    const themeValues = {
      logoSrc:
        theme.type === 'default' && theme.mode === 'light'
          ? blackLogo
          : whiteLogo,
      teamLogo:
        theme.type === 'team' && theme.team ? TEAM_LOGOS[theme.team] : null,
      colors: {
        headerBackground: colors.headerBackground,
        headerText: colors.headerText,
        mainBackground: colors.mainBackground,
        linkColor: colors.linkColor,
        activeLinkColor: colors.activeLinkColor,
        hoverLinkColor: colors.hoverLinkColor,
      },
      isBlackBackground: colors.headerBackground === '#000000',
    }

    // Dynamic CSS string for nav links
    const navLinkStyles = `
    .nav-link:not(.dropdown-link), .settings-icon {
      color: ${themeValues.colors.linkColor} !important;
      text-decoration: none;
      position: relative;
    }
    
    .nav-link.dropdown-link {
      color: ${theme.mode === 'dark' ? '#FFFFFF' : '#333333'} !important;
      text-decoration: none;
      position: relative;
    }
    
    .dropdown-link::after,
    .dropdown-trigger::after {
      display: none !important;
    }
    
    .nav-link:not(.dropdown-link):not(.dropdown-trigger)::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: -2px;
      left: 0;
      background-color: ${themeValues.colors.activeLinkColor};
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.3s ease;
    }

    .nav-link:not(.dropdown-link):not(.dropdown-trigger):hover::after {
      transform: scaleX(1);
      transform-origin: left;
    }
    
    .nav-link.active:not(.dropdown-link):not(.dropdown-trigger)::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: -2px;
      left: 0;
      background-color: ${themeValues.colors.activeLinkColor};
      transform: scaleX(1);
    }
      
    .mobile-nav-link {
      margin-bottom: 25px;
      font-size: 1.2rem;
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      color: ${theme.mode === 'dark' ? '#FFFFFF' : '#333333'} !important;
    }
    
    .mobile-nav-link.active {
      border-bottom: 3px solid ${themeValues.colors.activeLinkColor};
      padding-left: 0;
    }
  `

    return {
      ...themeValues,
      navLinkStyles,
    }
  }, [theme, colors])
}
