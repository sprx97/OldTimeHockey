import { Menu, Group, Center, Burger, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronRight } from '@tabler/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { Link, useLocation } from 'react-router-dom'
import { useState, useCallback, useMemo, memo } from 'react'
import routes from '../../routes'
import { ThemeControls } from '../ThemeControls'
import whiteLogo from '../../assets/logos/oth-wordmark-white.svg'
import blackLogo from '../../assets/logos/oth-wordmark-black.svg'
import { useTheme } from '../../contexts/ThemeContext'
import styles from './mainNavigation.module.scss'
import { TEAM_LOGOS } from '../../constants/teamLogos'

const MENU_Z_INDEX = 300
const MENU_TRANSITION_DURATION = 200

interface Anchor {
  path: string
  name: string
}

interface RouteWithAnchors {
  path: string
  name: string
  element?: React.ReactNode
  anchors?: Anchor[]
}

interface MenuItemProps {
  route: RouteWithAnchors
  isActive: boolean
  accessibleLinkColor: string
  headerBackgroundColor: string
}

interface MobileMenuItemProps {
  route: RouteWithAnchors
  isActive: boolean
  accessibleLinkColor: string
  openSubmenuIds: string[]
  toggleSubmenu: (path: string) => void
  closeMenu: () => void
  resetOpenSubmenuIds: () => void
  locationHash: string
}

interface ThemeMenuProps {
  headerBackgroundColor: string
  accessibleLinkColor: string
  accessibleHoverLinkColor: string
}

const MenuItem = memo(
  ({
    route,
    isActive,
    accessibleLinkColor,
    headerBackgroundColor,
  }: MenuItemProps) => {
    if (route.anchors) {
      const submenuItems = route.anchors.map((anchor) => (
        <Menu.Item key={anchor.path}>
          <Link
            to={route.path + anchor.path}
            className='nav-link'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {anchor.name}
          </Link>
        </Menu.Item>
      ))

      return (
        <Menu
          key={route.path}
          trigger='hover'
          transitionProps={{
            transition: 'scale-y',
            duration: MENU_TRANSITION_DURATION,
            exitDuration: 0,
            timingFunction: 'ease',
          }}
          withinPortal
          position='bottom-end'
          closeOnItemClick={false}
          closeOnClickOutside={false}
          trapFocus={false}
          zIndex={MENU_Z_INDEX}
          styles={() => ({
            dropdown: {
              backgroundColor: headerBackgroundColor,
            },
          })}
        >
          <Menu.Target>
            <Link
              to={route.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
              style={{
                color: accessibleLinkColor,
              }}
            >
              <span
                className={styles.navLinkContent}
                style={{
                  color: accessibleLinkColor,
                }}
              >
                {route.name}{' '}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  style={{ marginLeft: 5, fontSize: '0.9rem' }}
                />
              </span>
            </Link>
          </Menu.Target>
          <Menu.Dropdown>{submenuItems}</Menu.Dropdown>
        </Menu>
      )
    }

    return (
      <Link
        key={route.path}
        to={route.path}
        className={`nav-link ${isActive ? 'active' : ''}`}
        style={{
          color: accessibleLinkColor,
        }}
      >
        {route.name}
      </Link>
    )
  }
)

const MobileMenuItem = memo(
  ({
    route,
    isActive,
    accessibleLinkColor,
    openSubmenuIds,
    toggleSubmenu,
    closeMenu,
    resetOpenSubmenuIds,
    locationHash,
  }: MobileMenuItemProps) => {
    const handleCloseMenu = useCallback(() => {
      closeMenu()
      resetOpenSubmenuIds()
    }, [closeMenu, resetOpenSubmenuIds])

    const isSubmenuOpen = openSubmenuIds.includes(route.path)

    if (route.anchors) {
      return (
        <div key={route.path}>
          <Box
            onClick={() => toggleSubmenu(route.path)}
            className={styles.mobileMenuToggle}
            style={{
              color: accessibleLinkColor,
            }}
          >
            <span>{route.name}</span>
            {isSubmenuOpen ? (
              <FontAwesomeIcon
                icon={faChevronDown}
                style={{ fontSize: '1.2rem' }}
              />
            ) : (
              <IconChevronRight size='1.2rem' stroke={1.5} />
            )}
          </Box>
          <Box
            className={styles.submenuContainer}
            style={{
              height: isSubmenuOpen ? 'auto' : 0,
            }}
          >
            {route.anchors.map((anchor) => (
              <Link
                key={`${route.path}${anchor.path}`}
                to={route.path + anchor.path}
                className={`mobile-nav-link ${isActive && anchor.path === locationHash ? 'active' : ''}`}
                style={{
                  color: accessibleLinkColor,
                }}
                onClick={handleCloseMenu}
              >
                {anchor.name}
              </Link>
            ))}
          </Box>
        </div>
      )
    }

    return (
      <Link
        key={route.path}
        to={route.path}
        className={`mobile-nav-link ${isActive ? 'active' : ''}`}
        style={{
          color: accessibleLinkColor,
        }}
        onClick={handleCloseMenu}
      >
        {route.name}
      </Link>
    )
  }
)

const ThemeMenu = memo(
  ({
    headerBackgroundColor,
    accessibleLinkColor,
    accessibleHoverLinkColor,
  }: ThemeMenuProps) => {
    return (
      <Menu
        trigger='hover'
        transitionProps={{
          transition: 'scale-y',
          duration: MENU_TRANSITION_DURATION,
          exitDuration: 0,
          timingFunction: 'ease',
        }}
        withinPortal
        position='bottom-end'
        closeOnItemClick={false}
        closeOnClickOutside={false}
        trapFocus={false}
        zIndex={MENU_Z_INDEX}
        styles={() => ({
          dropdown: {
            backgroundColor: headerBackgroundColor,
          },
          item: {
            color: accessibleLinkColor,
            '&:hover': {
              color: accessibleHoverLinkColor,
            },
          },
        })}
      >
        <Menu.Target>
          <Center
            className={styles.settingsIcon}
            style={{ color: accessibleLinkColor }}
          >
            <FontAwesomeIcon icon={faGear} style={{ fontSize: '1.5rem' }} />
          </Center>
        </Menu.Target>
        <Menu.Dropdown>
          <Box p='xs'>
            <ThemeControls />
          </Box>
        </Menu.Dropdown>
      </Menu>
    )
  }
)

const MainNavigation = () => {
  const [opened, { toggle, close }] = useDisclosure(false)
  const [openSubmenuIds, setOpenSubmenuIds] = useState<string[]>([])
  const location = useLocation()
  const {
    theme,
    getHeaderBackgroundColor,
    getHeaderTextColor,
    getAccessibleLinkColor,
    getAccessibleActiveLinkColor,
    getAccessibleHoverLinkColor,
  } = useTheme()

  const logoSrc = useMemo(
    () =>
      theme.type === 'default' && theme.mode === 'light'
        ? blackLogo
        : whiteLogo,
    [theme.type, theme.mode]
  )

  const teamLogo = useMemo(
    () => (theme.type === 'team' && theme.team ? TEAM_LOGOS[theme.team] : null),
    [theme.type, theme.team]
  )

  const headerBackgroundColor = useMemo(
    () => getHeaderBackgroundColor(),
    [getHeaderBackgroundColor]
  )

  const headerTextColor = useMemo(
    () => getHeaderTextColor(),
    [getHeaderTextColor]
  )

  const accessibleLinkColor = useMemo(
    () => getAccessibleLinkColor(),
    [getAccessibleLinkColor]
  )

  const accessibleActiveLinkColor = useMemo(
    () => getAccessibleActiveLinkColor(),
    [getAccessibleActiveLinkColor]
  )

  const accessibleHoverLinkColor = useMemo(
    () => getAccessibleHoverLinkColor(),
    [getAccessibleHoverLinkColor]
  )

  const toggleSubmenu = useCallback((path: string) => {
    setOpenSubmenuIds((prev) =>
      prev.includes(path) ? prev.filter((id) => id !== path) : [...prev, path]
    )
  }, [])

  const resetOpenSubmenuIds = useCallback(() => {
    setOpenSubmenuIds([])
  }, [])

  const isCurrentPage = useCallback(
    (path: string) => {
      if (path === '/') {
        return location.pathname === path
      }
      return location.pathname.startsWith(path)
    },
    [location.pathname]
  )

  const handleBurgerClick = useCallback(() => {
    toggle()
    resetOpenSubmenuIds()
  }, [toggle, resetOpenSubmenuIds])

  const navigationItems = useMemo(
    () =>
      routes.map((route) => {
        const isActive = isCurrentPage(route.path)
        return (
          <MenuItem
            key={route.path}
            route={route as RouteWithAnchors}
            isActive={isActive}
            accessibleLinkColor={accessibleLinkColor}
            headerBackgroundColor={headerBackgroundColor}
          />
        )
      }),
    [isCurrentPage, accessibleLinkColor, headerBackgroundColor]
  )

  const mobileNavigationItems = useMemo(
    () =>
      routes.map((route) => {
        const isActive = isCurrentPage(route.path)
        return (
          <MobileMenuItem
            key={route.path}
            route={route as RouteWithAnchors}
            isActive={isActive}
            accessibleLinkColor={accessibleLinkColor}
            openSubmenuIds={openSubmenuIds}
            toggleSubmenu={toggleSubmenu}
            closeMenu={close}
            resetOpenSubmenuIds={resetOpenSubmenuIds}
            locationHash={location.hash}
          />
        )
      }),
    [
      isCurrentPage,
      accessibleLinkColor,
      openSubmenuIds,
      toggleSubmenu,
      close,
      resetOpenSubmenuIds,
      location.hash,
    ]
  )

  const navStyles = useMemo(
    () => `
    .nav-link, .settings-icon {
      color: ${accessibleLinkColor} !important;
      text-decoration: none;
      position: relative;
    }
    
    .nav-link::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: ${accessibleActiveLinkColor};
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.3s ease;
    }
    
    .nav-link:hover::after {
      transform: scaleX(1);
      transform-origin: left;
    }
    
    .nav-link.active::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: ${accessibleActiveLinkColor};
      transform: scaleX(1);
    }
    
    .mobile-nav-link.active {
      border-left: 3px solid ${accessibleActiveLinkColor};
      padding-left: 5px;
    }
  `,
    [accessibleLinkColor, accessibleActiveLinkColor]
  )

  return (
    <Box
      className={styles.headerContainer}
      style={{
        backgroundColor: getHeaderBackgroundColor(),
        color: getHeaderTextColor(),
        position: 'relative',
      }}
    >
      {teamLogo && (
        <div className={styles.teamLogoBackground}>
          <img src={teamLogo} alt='Team Logo Background' />
        </div>
      )}
      <style>{navStyles}</style>
      <Box size='100%' style={{ width: '100%' }}>
        <Box className={styles.headerBox}>
          <div className={styles.logoContainer}>
            <img
              src={logoSrc}
              alt='OldTimeHockey Logo'
              className={styles.logo}
            />
          </div>
          <Box className={styles.navContainer} visibleFrom='sm'>
            {navigationItems}
          </Box>
          <Group gap='sm' className={styles.navGroup}>
            {/* Desktop Theme Menu */}
            <Box visibleFrom='sm'>
              <ThemeMenu
                headerBackgroundColor={headerBackgroundColor}
                accessibleLinkColor={accessibleLinkColor}
                accessibleHoverLinkColor={accessibleHoverLinkColor}
              />
            </Box>
            {/* Mobile Theme Menu */}
            <Box hiddenFrom='sm'>
              <ThemeMenu
                headerBackgroundColor={headerBackgroundColor}
                accessibleLinkColor={accessibleLinkColor}
                accessibleHoverLinkColor={accessibleHoverLinkColor}
              />
            </Box>
            <Burger
              opened={opened}
              onClick={handleBurgerClick}
              size='sm'
              hiddenFrom='sm'
              color={headerTextColor}
            />
          </Group>
        </Box>
      </Box>
      <Box
        className={opened ? styles.mobileMenuOpen : styles.mobileMenu}
        style={{
          backgroundColor: headerBackgroundColor,
          color: headerTextColor,
        }}
      >
        {mobileNavigationItems}
        <Box className={styles.mobileMenuDivider} />
        <Box p='md'>
          <Box className={styles.mobileSettingsContainer}>
            <FontAwesomeIcon icon={faGear} style={{ fontSize: '1.5rem' }} />
          </Box>
          <Box px='md'>
            <ThemeControls />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MainNavigation
