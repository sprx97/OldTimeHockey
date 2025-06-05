import Hero from '../../Hero'
import styles from './home.module.scss'

function HomePage() {
  return (
    <div className={styles.homePage}>
      <Hero />
    </div>
  )
}

export default HomePage
