import { Link } from 'react-router-dom'
import styles from './mainNavigation.module.scss'

interface NavigationLogoProps {
  logoSrc: string
  teamLogo: string | null
}

const NavigationLogo = ({ logoSrc, teamLogo }: NavigationLogoProps) => {
  return (
    <>
      {teamLogo && (
        <div className={styles.teamLogoBackground}>
          <img src={teamLogo} alt='Team Logo Background' />
        </div>
      )}
      <div className={styles.logoContainer}>
        <Link
          to='/'
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            position: 'relative',
            zIndex: 3,
            cursor: 'pointer',
          }}
        >
          <img src={logoSrc} alt='OldTimeHockey Logo' className={styles.logo} />
        </Link>
      </div>
    </>
  )
}

export default NavigationLogo
