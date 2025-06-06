import { Menu, Group, Center, Burger, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import routes from '../../routes'
import { ThemeControls } from '../ThemeControls'
import whiteLogo from '../../assets/logos/oth-wordmark-white.svg'
import blackLogo from '../../assets/logos/oth-wordmark-black.svg'
import { useTheme } from '../../contexts/ThemeContext'
import styles from './mainNavigation.module.scss'
import { TEAM_LOGOS } from '../../constants/teamLogos'

interface RouteWithAnchors {
  path: string
  name: string
  anchors?: { path: string; name: string }[]
}

function MainNavigation() {
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

  const logoSrc =
    theme.type === 'default' && theme.mode === 'light' ? blackLogo : whiteLogo

  // Get the current team logo if a team theme is selected
  const teamLogo =
    theme.type === 'team' && theme.team ? TEAM_LOGOS[theme.team] : null

  const toggleSubmenu = (path: string) => {
    setOpenSubmenuIds((prev) =>
      prev.includes(path) ? prev.filter((id) => id !== path) : [...prev, path]
    )
  }

  const isCurrentPage = (path: string) => {
    if (path === '/') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const renderMenuItem = (route: RouteWithAnchors) => {
    const isActive = isCurrentPage(route.path)

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
            duration: 200,
            exitDuration: 0,
            timingFunction: 'ease',
          }}
          withinPortal
          position='bottom-end'
          closeOnItemClick={false}
          closeOnClickOutside={false}
          trapFocus={false}
          zIndex={300}
          styles={() => ({
            dropdown: {
              backgroundColor: getHeaderBackgroundColor(),
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
                  ? getAccessibleActiveLinkColor()
                  : getAccessibleLinkColor(),
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: isActive
                    ? getAccessibleActiveLinkColor()
                    : getAccessibleLinkColor(),
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
          color: isActive
            ? getAccessibleActiveLinkColor()
            : getAccessibleLinkColor(),
        }}
      >
        {route.name}
      </Link>
    )
  }

  const renderMobileMenuItem = (route: RouteWithAnchors) => {
    const isSubmenuOpen = openSubmenuIds.includes(route.path)
    const isActive = isCurrentPage(route.path)

    if (route.anchors) {
      return (
        <div key={route.path}>
          <Box
            onClick={() => toggleSubmenu(route.path)}
            className='mobile-menu-toggle'
            style={{
              color: isActive
                ? getAccessibleActiveLinkColor()
                : getAccessibleLinkColor(),
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
                className={`mobile-nav-link ${isActive && anchor.path === location.hash ? 'active' : ''}`}
                style={{
                  color:
                    isActive && anchor.path === location.hash
                      ? getAccessibleActiveLinkColor()
                      : getAccessibleLinkColor(),
                }}
                onClick={() => {
                  close()
                  setOpenSubmenuIds([])
                }}
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
          color: isActive
            ? getAccessibleActiveLinkColor()
            : getAccessibleLinkColor(),
        }}
        onClick={() => {
          close()
          setOpenSubmenuIds([])
        }}
      >
        {route.name}
      </Link>
    )
  }

  const navigationItems = routes.map((route) =>
    renderMenuItem(route as RouteWithAnchors)
  )

  const mobileNavigationItems = routes.map((route) =>
    renderMobileMenuItem(route as RouteWithAnchors)
  )

  return (
    <Box
      style={{
        height: '60px',
        padding: '0 var(--mantine-spacing-md)',
        backgroundColor: getHeaderBackgroundColor(),
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
        color: getHeaderTextColor(),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {teamLogo && (
        <div className={styles.teamLogoBackground}>
          <img src={teamLogo} alt='Team Logo Background' />
        </div>
      )}
      <style>
        {`
        .nav-link, .settings-icon {
            color: ${getAccessibleLinkColor()} !important;
          }
          .nav-link.active, .mobile-nav-link.active {
            color: ${getAccessibleActiveLinkColor()} !important;
          }
          .nav-link:hover, .settings-icon:hover {
            color: ${getAccessibleHoverLinkColor()} !important;
          }
        `}
      </style>
      <Box size='100%' style={{ width: '100%' }}>
        <Box
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              flex: '0 0 auto',
              marginRight: '20px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <img
              src={logoSrc}
              alt='OldTimeHockey Logo'
              style={{ height: '28px', width: 'auto' }}
            />
          </div>
          <Box
            style={{
              height: '100%',
              alignItems: 'center',
              flex: '1 1 auto',
              justifyContent: 'flex-end',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 2,
            }}
            visibleFrom='sm'
          >
            {navigationItems}
          </Box>
          <Group
            gap='sm'
            style={{
              height: '100%',
              alignItems: 'center',
              flex: '0 1 auto',
              justifyContent: 'flex-end',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Desktop Theme Menu */}
            <Box visibleFrom='sm'>
              <Menu
                trigger='hover'
                transitionProps={{
                  transition: 'scale-y',
                  duration: 200,
                  exitDuration: 0,
                  timingFunction: 'ease',
                }}
                withinPortal
                position='bottom-end'
                closeOnItemClick={false}
                closeOnClickOutside={false}
                trapFocus={false}
                zIndex={300}
                styles={() => ({
                  dropdown: {
                    backgroundColor: getHeaderBackgroundColor(),
                  },
                  item: {
                    color: getAccessibleLinkColor(),
                    '&:hover': {
                      color: getAccessibleHoverLinkColor(),
                    },
                  },
                })}
              >
                <Menu.Target>
                  <Center
                    className='settings-icon'
                    style={{ height: '100%', color: getAccessibleLinkColor() }}
                  >
                    <FontAwesomeIcon
                      icon={faGear}
                      style={{ fontSize: '1.5rem' }}
                    />
                  </Center>
                </Menu.Target>
                <Menu.Dropdown>
                  <Box p='xs'>
                    <ThemeControls />
                  </Box>
                </Menu.Dropdown>
              </Menu>
            </Box>
            {/* Mobile Theme Menu */}
            <Box hiddenFrom='sm'>
              <Menu
                trigger='hover'
                transitionProps={{
                  transition: 'scale-y',
                  duration: 200,
                  exitDuration: 0,
                  timingFunction: 'ease',
                }}
                withinPortal
                position='bottom-end'
                closeOnItemClick={false}
                closeOnClickOutside={false}
                trapFocus={false}
                zIndex={300}
                styles={() => ({
                  dropdown: {
                    backgroundColor: getHeaderBackgroundColor(),
                  },
                  item: {
                    color: getAccessibleLinkColor(),
                    '&:hover': {
                      color: getAccessibleHoverLinkColor(),
                    },
                  },
                })}
              >
                <Menu.Target>
                  <Center
                    className='settings-icon'
                    style={{ height: '100%', color: getAccessibleLinkColor() }}
                  >
                    <FontAwesomeIcon
                      icon={faGear}
                      style={{ fontSize: '1.5rem' }}
                    />
                  </Center>
                </Menu.Target>
                <Menu.Dropdown>
                  <Box p='xs'>
                    <ThemeControls />
                  </Box>
                </Menu.Dropdown>
              </Menu>
            </Box>
            <Burger
              opened={opened}
              onClick={() => {
                toggle()
                setOpenSubmenuIds([])
              }}
              size='sm'
              hiddenFrom='sm'
              color={getHeaderTextColor()}
            />
          </Group>
        </Box>
      </Box>
      <Box
        className='mobile-menu'
        style={{
          position: 'fixed',
          top: 60,
          left: 0,
          right: 0,
          bottom: 0,
          padding: 'var(--mantine-spacing-md)',
          backgroundColor: getHeaderBackgroundColor(),
          color: getHeaderTextColor(),
          overflow: 'auto',
          transform: opened ? 'translateX(0)' : 'translateX(100%)',
          zIndex: 100,
        }}
      >
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
