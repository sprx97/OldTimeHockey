import { Menu, Group, Center, Burger, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { Link, useLocation } from 'react-router-dom'
import { useState, useCallback, useMemo, memo, FC, CSSProperties } from 'react'
import routes from '../../routes'
import { ThemeControls } from '../ThemeControls'
import whiteLogo from '../../assets/logos/oth-wordmark-white.svg'
import blackLogo from '../../assets/logos/oth-wordmark-black.svg'
import { useTheme } from '../../contexts/ThemeContext'
import styles from './mainNavigation.module.scss'
import { TEAM_LOGOS } from '../../constants/teamLogos'

// Constants
const HEADER_HEIGHT = 60
const MENU_Z_INDEX = 300
const MOBILE_MENU_Z_INDEX = 100
const LOGO_HEIGHT = 28
const MENU_TRANSITION_DURATION = 200
const LOGO_MARGIN_RIGHT = 20

// Types
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
  accessibleActiveLinkColor: string
  headerBackgroundColor: string
}

interface MobileMenuItemProps {
  route: RouteWithAnchors
  isActive: boolean
  accessibleLinkColor: string
  accessibleActiveLinkColor: string
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

// Memoized MenuItem component
const MenuItem: FC<MenuItemProps> = memo(
  ({
    route,
    isActive,
    accessibleLinkColor,
    accessibleActiveLinkColor,
    headerBackgroundColor,
  }) => {
    // If the route has anchors, render a dropdown menu
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
                display: 'inline-flex',
                alignItems: 'center',
                height: '100%',
                color: isActive
                  ? accessibleActiveLinkColor
                  : accessibleLinkColor,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: isActive
                    ? accessibleActiveLinkColor
                    : accessibleLinkColor,
                }}
              >
                {route.name}{' '}
                <IconChevronDown
                  size='0.9rem'
                  stroke={1.5}
                  style={{ marginLeft: 5 }}
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
          display: 'inline-flex',
          alignItems: 'center',
          height: '100%',
          color: isActive ? accessibleActiveLinkColor : accessibleLinkColor,
        }}
      >
        {route.name}
      </Link>
    )
  }
)

const MobileMenuItem: FC<MobileMenuItemProps> = memo(
  ({
    route,
    isActive,
    accessibleLinkColor,
    accessibleActiveLinkColor,
    openSubmenuIds,
    toggleSubmenu,
    closeMenu,
    resetOpenSubmenuIds,
    locationHash,
  }) => {
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
            className='mobile-menu-toggle'
            style={{
              color: isActive ? accessibleActiveLinkColor : accessibleLinkColor,
            }}
          >
            <span>{route.name}</span>
            {isSubmenuOpen ? (
              <IconChevronDown size='1.2rem' stroke={1.5} />
            ) : (
              <IconChevronRight size='1.2rem' stroke={1.5} />
            )}
          </Box>
          <Box
            className='submenu-container'
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
                  color:
                    isActive && anchor.path === locationHash
                      ? accessibleActiveLinkColor
                      : accessibleLinkColor,
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
          color: isActive ? accessibleActiveLinkColor : accessibleLinkColor,
        }}
        onClick={handleCloseMenu}
      >
        {route.name}
      </Link>
    )
  }
)

const ThemeMenu: FC<ThemeMenuProps> = memo(
  ({
    headerBackgroundColor,
    accessibleLinkColor,
    accessibleHoverLinkColor,
  }) => {
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
            className='settings-icon'
            style={{ height: '100%', color: accessibleLinkColor }}
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

const MainNavigation: FC = () => {
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
            accessibleActiveLinkColor={accessibleActiveLinkColor}
            headerBackgroundColor={headerBackgroundColor}
          />
        )
      }),
    [
      isCurrentPage,
      accessibleLinkColor,
      accessibleActiveLinkColor,
      headerBackgroundColor,
    ]
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
            accessibleActiveLinkColor={accessibleActiveLinkColor}
            openSubmenuIds={openSubmenuIds}
            toggleSubmenu={toggleSubmenu}
            closeMenu={close}
            resetOpenSubmenuIds={resetOpenSubmenuIds}
            locationHash={location.hash}
          />
        )
      }),
    [
      routes,
      isCurrentPage,
      accessibleLinkColor,
      accessibleActiveLinkColor,
      openSubmenuIds,
      toggleSubmenu,
      close,
      resetOpenSubmenuIds,
      location.hash,
    ]
  )

  const headerStyles = useMemo(
    (): CSSProperties => ({
      height: `${HEADER_HEIGHT}px`,
      padding: '0 var(--mantine-spacing-md)',
      backgroundColor: headerBackgroundColor,
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'center',
      color: headerTextColor,
      position: 'relative',
      overflow: 'hidden',
    }),
    [headerBackgroundColor, headerTextColor]
  )

  const logoContainerStyles = useMemo(
    (): CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      flex: '0 0 auto',
      marginRight: `${LOGO_MARGIN_RIGHT}px`,
      position: 'relative',
      zIndex: 2,
    }),
    []
  )

  const logoStyles = useMemo(
    (): CSSProperties => ({
      height: `${LOGO_HEIGHT}px`,
      width: 'auto',
    }),
    []
  )

  const navContainerStyles = useMemo(
    (): CSSProperties => ({
      height: '100%',
      alignItems: 'center',
      flex: '1 1 auto',
      justifyContent: 'flex-end',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      position: 'relative',
      zIndex: 2,
    }),
    []
  )

  const groupStyles = useMemo(
    (): CSSProperties => ({
      height: '100%',
      alignItems: 'center',
      flex: '0 1 auto',
      justifyContent: 'flex-end',
      position: 'relative',
      zIndex: 2,
    }),
    []
  )

  const mobileMenuStyles = useMemo(
    (): CSSProperties => ({
      position: 'fixed',
      top: HEADER_HEIGHT,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 'var(--mantine-spacing-md)',
      backgroundColor: headerBackgroundColor,
      color: headerTextColor,
      overflow: 'auto',
      transform: opened ? 'translateX(0)' : 'translateX(100%)',
      zIndex: MOBILE_MENU_Z_INDEX,
    }),
    [opened, headerBackgroundColor, headerTextColor]
  )

  const navStyles = useMemo(
    () => `
    .nav-link, .settings-icon {
      color: ${accessibleLinkColor} !important;
    }
    .nav-link.active, .mobile-nav-link.active {
      color: ${accessibleActiveLinkColor} !important;
    }
    .nav-link:hover, .settings-icon:hover {
      color: ${accessibleHoverLinkColor} !important;
    }
  `,
    [accessibleLinkColor, accessibleActiveLinkColor, accessibleHoverLinkColor]
  )

  return (
    <Box style={headerStyles}>
      {teamLogo && (
        <div className={styles.teamLogoBackground}>
          <img src={teamLogo} alt='Team Logo Background' />
        </div>
      )}
      <style>{navStyles}</style>
      <Box size='100%' style={{ width: '100%' }}>
        <Box
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={logoContainerStyles}>
            <img src={logoSrc} alt='OldTimeHockey Logo' style={logoStyles} />
          </div>
          <Box style={navContainerStyles} visibleFrom='sm'>
            {navigationItems}
          </Box>
          <Group gap='sm' style={groupStyles}>
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
      <Box className='mobile-menu' style={mobileMenuStyles}>
        {mobileNavigationItems}
        <Box
          style={{
            margin: 'var(--mantine-spacing-md) 0',
            borderTop: '1px solid var(--mantine-color-default-border)',
          }}
        />
        <Box p='md'>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--mantine-spacing-sm)',
              fontSize: 'var(--mantine-font-size-lg)',
              fontWeight: 500,
              marginBottom: 'var(--mantine-spacing-md)',
            }}
          >
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
