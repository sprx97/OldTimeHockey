import { Menu, Group, Center, Box } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useMemo, memo } from 'react'
import { IoChevronDownSharp } from 'react-icons/io5'
import { FaGear } from 'react-icons/fa6'
import routes from '@/routes'
import { ThemeControls } from '@components/ThemeControls'
import { ThemeConfig } from '@/types/theme'
import { NAVIGATION_CONSTANTS } from '@/constants/navigation'
import styles from './mainNavigation.module.scss'

interface DesktopNavigationProps {
  colors: {
    headerBackground: string
    headerText: string
    mainBackground: string
    linkColor: string
    activeLinkColor: string
    hoverLinkColor: string
  }
  theme: ThemeConfig
  isCurrentPage: (path: string) => boolean
}

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
  colors: DesktopNavigationProps['colors']
  theme: ThemeConfig
}

interface ThemeMenuProps {
  colors: DesktopNavigationProps['colors']
}

const MenuItem = memo(({ route, isActive, colors, theme }: MenuItemProps) => {
  if (route.anchors) {
    const submenuItems = route.anchors.map((anchor) => (
      <Menu.Item key={anchor.path}>
        <Link
          to={route.path + anchor.path}
          className='nav-link dropdown-link'
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: '8px 16px',
            color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'} !important`,
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
          transition: 'fade',
          duration: NAVIGATION_CONSTANTS.MENU_TRANSITION_DURATION,
          exitDuration:
            NAVIGATION_CONSTANTS.MENU_TRANSITION_DURATION *
            NAVIGATION_CONSTANTS.DROPDOWN_EXIT_DURATION_RATIO,
          timingFunction: 'ease',
        }}
        withinPortal
        position='bottom-end'
        closeOnItemClick={false}
        closeOnClickOutside={true}
        trapFocus={true}
        zIndex={NAVIGATION_CONSTANTS.MENU_Z_INDEX}
        aria-label={`${route.name} submenu`}
        styles={() => ({
          dropdown: {
            backgroundColor: colors.mainBackground,
            transform: 'translateY(0)',
            opacity: 1,
            animation: `${styles.dropdownAnimation} ${NAVIGATION_CONSTANTS.MENU_TRANSITION_DURATION}ms ease`,
            paddingTop: 0,
            paddingBottom: 0,
          },
          item: {
            borderRadius: 0,
            color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'} !important`,
            padding: 0,
            '&:hover': {
              backgroundColor:
                theme.mode === 'dark'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)',
              color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'} !important`,
            },
            '& a': {
              color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'} !important`,
              width: '100%',
              height: '100%',
            },
            '& *': {
              color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'} !important`,
            },
          },
          itemLabel: {
            color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'} !important`,
          },
        })}
      >
        <Menu.Target>
          <Link
            to={route.path}
            className={`nav-link dropdown-trigger ${isActive ? 'active' : ''}`}
            style={{
              color: colors.linkColor,
            }}
            aria-expanded={false}
            aria-haspopup='menu'
            role='button'
            tabIndex={0}
          >
            <span
              className={styles.navLinkContent}
              style={{
                color: colors.linkColor,
              }}
            >
              {route.name}{' '}
              <IoChevronDownSharp
                style={{ marginLeft: 5, fontSize: '1.2rem' }}
                aria-hidden='true'
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
        color: colors.linkColor,
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      {route.name}
    </Link>
  )
})

const ThemeMenu = memo(({ colors }: ThemeMenuProps) => {
  return (
    <Menu
      trigger='hover'
      transitionProps={{
        transition: 'fade',
        duration: NAVIGATION_CONSTANTS.MENU_TRANSITION_DURATION,
        exitDuration:
          NAVIGATION_CONSTANTS.MENU_TRANSITION_DURATION *
          NAVIGATION_CONSTANTS.DROPDOWN_EXIT_DURATION_RATIO,
        timingFunction: 'ease',
      }}
      withinPortal
      position='bottom-end'
      closeOnItemClick={false}
      closeOnClickOutside={false}
      trapFocus={false}
      zIndex={NAVIGATION_CONSTANTS.MENU_Z_INDEX}
      styles={() => ({
        dropdown: {
          backgroundColor: colors.mainBackground,
          transform: 'translateY(0)',
          opacity: 1,
          animation: `${styles.dropdownAnimation} ${NAVIGATION_CONSTANTS.MENU_TRANSITION_DURATION}ms ease`,
          paddingTop: 0,
          paddingBottom: 0,
        },
        item: {
          color: colors.linkColor,
          borderRadius: 0,
          '&:hover': {
            color: colors.hoverLinkColor,
          },
        },
      })}
    >
      <Menu.Target>
        <Center
          className={styles.settingsIcon}
          style={{ color: colors.linkColor }}
        >
          <FaGear style={{ fontSize: '1.5rem' }} />
        </Center>
      </Menu.Target>
      <Menu.Dropdown>
        <Box p='xs'>
          <ThemeControls />
        </Box>
      </Menu.Dropdown>
    </Menu>
  )
})

const DesktopNavigation = ({
  colors,
  theme,
  isCurrentPage,
}: DesktopNavigationProps) => {
  const navigationItems = useMemo(
    () =>
      routes.map((route) => {
        const isActive = isCurrentPage(route.path)
        return (
          <MenuItem
            key={route.path}
            route={route as RouteWithAnchors}
            isActive={isActive}
            colors={colors}
            theme={theme}
          />
        )
      }),
    [isCurrentPage, colors, theme]
  )

  return (
    <>
      <Box className={`${styles.navContainer} nav-container`} visibleFrom='sm'>
        {navigationItems}
      </Box>
      <Group gap='sm' className={styles.navGroup} justify='flex-end'>
        <Box visibleFrom='sm'>
          <ThemeMenu colors={colors} />
        </Box>
      </Group>
    </>
  )
}

export default DesktopNavigation
