import { Box, Title, Text, Group, Container } from '@mantine/core'
import { LinkButton } from '@components/Button'
import styles from './hero.module.scss'
import playerImage from '@assets/player_with_puck.png'
import dotsBgLrg from '@assets/backgrounds/dots_bg_lrg.png'
import dotsBgSm from '@assets/backgrounds/dots_bg_sm.png'
import { memo, useMemo } from 'react'
import { useTheme } from '@contexts/ThemeContext'

interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
  primaryButtonText?: string
  secondaryButtonText?: string
  primaryButtonLink?: string
  secondaryButtonLink?: string
}

const Hero = memo(function Hero({
  title = 'The Ultimate Fantasy Hockey Gauntlet',
  subtitle = 'Old Time Hockey',
  description = '238 teams. 17 leagues. Promotion. Relegation. Glory awaits.',
  primaryButtonText = 'Join Now',
  secondaryButtonText = 'LEARN MORE',
  primaryButtonLink = '#join',
  secondaryButtonLink = '#learn',
}: HeroProps) {
  const { colors } = useTheme()

  const backgroundStyles = useMemo(
    () => ({
      dotsBgLrg: { backgroundImage: `url(${dotsBgLrg})` },
      dotsBgSm: { backgroundImage: `url(${dotsBgSm})` },
    }),
    []
  )

  const subtitleStyles = useMemo(
    () => ({
      color: colors.hoverLinkColor,
    }),
    [colors.hoverLinkColor]
  )

  return (
    <Box className={styles.heroContainer}>
      {/* Background elements */}
      <div className={styles.dotsBgLrg} style={backgroundStyles.dotsBgLrg} />
      <div className={styles.dotsBgSm} style={backgroundStyles.dotsBgSm} />

      <Container size='xl' className={styles.container}>
        <Box className={styles.contentContainer}>
          <Box className={styles.textContent}>
            <Text className={styles.subtitle} style={subtitleStyles}>
              {subtitle}
            </Text>
            <Title className={styles.title}>{title}</Title>
            <Text className={styles.description}>{description}</Text>

            <Group mt='xl'>
              <LinkButton
                href={primaryButtonLink}
                variant='primary'
                className={styles.primaryButton}
              >
                {primaryButtonText}
              </LinkButton>
              <LinkButton
                href={secondaryButtonLink}
                variant='secondary'
                className={styles.secondaryButton}
              >
                {secondaryButtonText}
              </LinkButton>
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
})

export default Hero
