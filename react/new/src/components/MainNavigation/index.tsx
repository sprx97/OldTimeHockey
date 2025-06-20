import { Box } from '@mantine/core'
import { useNavigationState } from './useNavigationState'
import { useNavigationStyles } from './useNavigationStyles'
import NavigationLogo from './NavigationLogo'
import DesktopNavigation from './DesktopNavigation'
import MobileNavigation from './MobileNavigation'
import { useTheme } from '@/contexts/ThemeContext'
import styles from './mainNavigation.module.scss'

const MainNavigation = () => {
  const navigationState = useNavigationState()
  const navigationStyles = useNavigationStyles()
  const { theme } = useTheme()

  const {
    opened,
    openSubmenuIds,
    location,
    toggleSubmenu,
    close,
    resetOpenSubmenuIds,
    isCurrentPage,
    handleBurgerClick,
  } = navigationState

  const { logoSrc, teamLogo, colors, isBlackBackground, navLinkStyles } =
    navigationStyles

  return (
    <Box
      className={`${styles.headerContainer} ${isBlackBackground ? styles.blackBackground : ''}`}
      style={{
        backgroundColor: colors.headerBackground,
        color: colors.headerText,
        position: 'relative',
      }}
    >
      <NavigationLogo logoSrc={logoSrc} teamLogo={null} />
      <style>{navLinkStyles}</style>
      <Box size='100%' style={{ width: '100%' }}>
        <Box
          className={styles.headerBox}
          style={{ justifyContent: 'space-between' }}
        >
          <DesktopNavigation
            colors={colors}
            theme={theme}
            isCurrentPage={isCurrentPage}
          />
          <MobileNavigation
            opened={opened}
            openSubmenuIds={openSubmenuIds}
            colors={colors}
            theme={theme}
            isCurrentPage={isCurrentPage}
            toggleSubmenu={toggleSubmenu}
            close={close}
            resetOpenSubmenuIds={resetOpenSubmenuIds}
            locationHash={location.hash}
            handleBurgerClick={handleBurgerClick}
          />
        </Box>
      </Box>
      {teamLogo && (
        <div className={styles.teamLogoBackground}>
          <img src={teamLogo} alt='Team Logo Background' />
        </div>
      )}
    </Box>
  )
}

export default MainNavigation
