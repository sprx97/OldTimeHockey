import { CSSProperties, useMemo } from 'react'
import { useTheme } from '@contexts/ThemeContext'

export type ButtonVariant = 'primary' | 'secondary' | 'text'

type CSSPropertiesWithVars = CSSProperties & {
  [key: `--${string}`]: string
}

export function useButtonStyles(
  variant: ButtonVariant = 'primary',
  style?: CSSProperties
) {
  const { theme, colors } = useTheme()

  const styles = useMemo(() => {
    const baseStyle: CSSPropertiesWithVars = {
      ...(style as CSSPropertiesWithVars),
    }

    const headerBgColor = colors.headerBackground
    const activeLinkColor = colors.activeLinkColor

    if (variant === 'primary') {
      const bgColor =
        theme.type === 'team' && theme.team ? headerBgColor : '#000'

      baseStyle.backgroundColor = bgColor
      baseStyle.color = '#fff'
      baseStyle.border = 'none'
      baseStyle['--hover-bg-color'] = activeLinkColor
      baseStyle['--hover-text-color'] = '#fff'
      baseStyle['--primary-color'] = activeLinkColor
    } else if (variant === 'secondary') {
      const borderColor =
        theme.type === 'team' && theme.team ? headerBgColor : '#000'
      const textColor =
        theme.type === 'team' && theme.team
          ? headerBgColor
          : theme.mode === 'light'
            ? '#333'
            : '#000'

      baseStyle.backgroundColor = '#fff'
      baseStyle.color = textColor
      baseStyle.border = `1px solid ${borderColor}`
      baseStyle['--hover-bg-color'] = activeLinkColor
      baseStyle['--hover-text-color'] = '#fff'
      baseStyle['--hover-border-color'] = activeLinkColor
      baseStyle['--primary-color'] = activeLinkColor
    } else if (variant === 'text') {
      let textColor = '#000'

      if (theme.type === 'team' && theme.team) {
        textColor = headerBgColor
      } else if (theme.mode === 'light') {
        textColor = '#333'
      } else {
        textColor = '#fff'
      }

      baseStyle.color = textColor
      baseStyle['--hover-text-color'] = activeLinkColor
      baseStyle['--primary-color'] = activeLinkColor
    }

    return baseStyle
  }, [variant, style, theme, colors.headerBackground, colors.activeLinkColor])

  return useMemo(
    () => ({
      styles,
      className: variant,
    }),
    [styles, variant]
  )
}
