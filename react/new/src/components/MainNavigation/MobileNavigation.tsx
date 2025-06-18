import { Burger, Box } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useMemo, useCallback, memo } from 'react'
import routes from '@/routes'
import { ThemeControls } from '@components/ThemeControls'
import { ThemeConfig } from '@/types/theme'
import { AiOutlineHome, AiOutlineBarChart } from 'react-icons/ai'
import { GoListOrdered } from 'react-icons/go'
import { BsInfoCircle, BsTrophy } from 'react-icons/bs'
import { GrDocumentVerified } from 'react-icons/gr'
import { FaChevronRight, FaChevronDown } from 'react-icons/fa6'
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

const getRouteIcon = (routeName: string): React.ReactNode => {
  const iconStyle = { fontSize: '1.2rem', marginRight: '0.5rem' }
  switch (routeName) {
    case 'Home':
      return <AiOutlineHome style={iconStyle} />
    case 'About':
      return <BsInfoCircle style={iconStyle} />
    case 'Rules':
      return <GrDocumentVerified style={iconStyle} />
    case 'Leaderboard':
      return <AiOutlineBarChart style={iconStyle} />
    case 'Standings':
      return <GoListOrdered style={iconStyle} />
    case 'Awards':
      return <BsTrophy style={iconStyle} />
    default:
      return <AiOutlineHome style={iconStyle} />
  }
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
    const routeIcon = getRouteIcon(route.name)

    if (route.anchors) {
      return (
        <div key={route.path} style={{ width: '100%' }}>
          <Link
            to={route.path}
            className={
              isActive
                ? styles.mobileNavLinkActive
                : styles.mobileNavLinkWithSubmenu
            }
            style={{
              color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'}`,
            }}
            onClick={(e) => {
              e.preventDefault()
              toggleSubmenu(route.path)
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {routeIcon}
              <span>{route.name}</span>
            </div>
            {isSubmenuOpen ? (
              <FaChevronDown style={{ fontSize: '1.2rem' }} />
            ) : (
              <FaChevronRight style={{ fontSize: '1.2rem' }} />
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
                className={
                  isActive && anchor.path === locationHash
                    ? styles.mobileNavLinkActive
                    : styles.mobileNavLink
                }
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
        className={isActive ? styles.mobileNavLinkActive : styles.mobileNavLink}
        style={{
          color: `${theme.mode === 'dark' ? '#FFFFFF' : '#333333'}`,
        }}
        onClick={handleCloseMenu}
      >
        {routeIcon}
        <span>{route.name}</span>
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
        style={{
          position: 'relative',
          zIndex: 20,
        }}
      />
      <Box
        className={opened ? styles.mobileMenuOpen : styles.mobileMenu}
        style={{
          backgroundColor: colors.mainBackground,
          color: colors.headerText,
          padding: '0 0 30px 0',
        }}
        role='navigation'
        aria-label='Mobile navigation menu'
        aria-hidden={!opened}
      >
        {mobileNavigationItems}
        <Box style={{ width: '100%' }}>
          <ThemeControls variant='mobile' />
        </Box>
      </Box>
    </>
  )
}

export default MobileNavigation
