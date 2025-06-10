import { Burger, Box } from '@mantine/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { useMemo, useCallback, memo } from 'react'
import routes from '@/routes'
import { ThemeControls } from '@components/ThemeControls'
import { ThemeConfig } from '../../types/theme'
import styles from './mainNavigation.module.scss'

interface MobileNavigationProps {
  opened: boolean
  openSubmenuIds: string[]
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
  toggleSubmenu: (path: string) => void
  close: () => void
  resetOpenSubmenuIds: () => void
  locationHash: string
  handleBurgerClick: () => void
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

interface MobileMenuItemProps {
  route: RouteWithAnchors
  isActive: boolean
  openSubmenuIds: string[]
  toggleSubmenu: (path: string) => void
  closeMenu: () => void
  resetOpenSubmenuIds: () => void
  locationHash: string
  theme: ThemeConfig
}

const MobileMenuItem = memo(
  ({
    route,
    isActive,
    openSubmenuIds,
    toggleSubmenu,
    closeMenu,
    resetOpenSubmenuIds,
    locationHash,
    theme,
  }: MobileMenuItemProps) => {
    const handleCloseMenu = useCallback(() => {
      closeMenu()
      resetOpenSubmenuIds()
    }, [closeMenu, resetOpenSubmenuIds])

    const isSubmenuOpen = openSubmenuIds.includes(route.path)

    if (route.anchors) {
      return (
        <div key={route.path}>
          <Link
            to={route.path}
            className={`mobile-nav-link ${isActive ? 'active' : ''}`}
            style={{
              color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
            onClick={(e) => {
              e.preventDefault()
              toggleSubmenu(route.path)
            }}
          >
            <span>{route.name}</span>
            {isSubmenuOpen ? (
              <FontAwesomeIcon
                icon={faChevronDown}
                style={{ fontSize: '1.2rem' }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faChevronDown}
                style={{ fontSize: '1.2rem', transform: 'rotate(-90deg)' }}
              />
            )}
          </Link>
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
                  color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'}`,
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
          color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'}`,
        }}
        onClick={handleCloseMenu}
      >
        {route.name}
      </Link>
    )
  }
)

const MobileNavigation = ({
  opened,
  openSubmenuIds,
  colors,
  theme,
  isCurrentPage,
  toggleSubmenu,
  close,
  resetOpenSubmenuIds,
  locationHash,
  handleBurgerClick,
}: MobileNavigationProps) => {
  const mobileNavigationItems = useMemo(
    () =>
      routes.map((route) => {
        const isActive = isCurrentPage(route.path)
        return (
          <MobileMenuItem
            key={route.path}
            route={route as RouteWithAnchors}
            isActive={isActive}
            openSubmenuIds={openSubmenuIds}
            toggleSubmenu={toggleSubmenu}
            closeMenu={close}
            resetOpenSubmenuIds={resetOpenSubmenuIds}
            locationHash={locationHash}
            theme={theme}
          />
        )
      }),
    [
      isCurrentPage,
      openSubmenuIds,
      toggleSubmenu,
      close,
      resetOpenSubmenuIds,
      locationHash,
      theme,
    ]
  )

  return (
    <>
      <Burger
        opened={opened}
        onClick={handleBurgerClick}
        size='md'
        hiddenFrom='sm'
        color={colors.linkColor}
        aria-label={opened ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={opened}
      />
      <Box
        className={opened ? styles.mobileMenuOpen : styles.mobileMenu}
        style={{
          backgroundColor: colors.mainBackground,
          color: colors.headerText,
        }}
        role='navigation'
        aria-label='Mobile navigation menu'
        aria-hidden={!opened}
      >
        {mobileNavigationItems}
        <hr className={styles.mobileMenuHr} />
        <Box p='md' style={{ width: '100%' }}>
          <ThemeControls />
        </Box>
      </Box>
    </>
  )
}

export default MobileNavigation
