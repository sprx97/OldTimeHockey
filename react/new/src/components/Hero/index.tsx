import { Box, Title, Text, Button, Group, Container } from '@mantine/core'
import styles from './hero.module.scss'
import buttonStyles from '../../styles/buttons.module.scss'
import playerImage from '../../assets/player_with_puck.png'
import dotsBgLrg from '../../assets/backgrounds/dots_bg_lrg.png'
import dotsBgSm from '../../assets/backgrounds/dots_bg_sm.png'

interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
  primaryButtonText?: string
  secondaryButtonText?: string
  primaryButtonLink?: string
  secondaryButtonLink?: string
}

function Hero({
  title = 'THE ULTIMATE FANTASY HOCKEY GAUNTLET',
  subtitle = 'Old Time Hockey',
  description = '238 teams. 17 leagues. Promotion. Relegation. Glory awaits.',
  primaryButtonText = 'Join Now',
  secondaryButtonText = 'LEARN MORE',
  primaryButtonLink = '#join',
  secondaryButtonLink = '#learn',
}: HeroProps) {
  return (
    <Box className={styles.heroContainer}>
      {/* Background elements */}
      <div
        className={styles.dotsBgLrg}
        style={{ backgroundImage: `url(${dotsBgLrg})` }}
      />
      <div
        className={styles.dotsBgSm}
        style={{ backgroundImage: `url(${dotsBgSm})` }}
      />

      <Container size='xl' className={styles.container}>
        <Box className={styles.contentContainer}>
          <Box className={styles.textContent}>
            <Text className={styles.subtitle}>{subtitle}</Text>
            <Title className={styles.title}>{title}</Title>
            <Text className={styles.description}>{description}</Text>

            <Group mt='xl'>
              <Button
                component='a'
                href={primaryButtonLink}
                variant='filled'
                className={`${styles.primaryButton} ${buttonStyles.primary}`}
              >
                {primaryButtonText}
              </Button>
              <Button
                component='a'
                href={secondaryButtonLink}
                variant='outline'
                className={`${styles.secondaryButton} ${buttonStyles.secondary}`}
              >
                {secondaryButtonText}
              </Button>
            </Group>
          </Box>

          <Box className={styles.imageContainer}>
            <img
              src={playerImage}
              alt='Hockey Player'
              className={styles.playerImage}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Hero
