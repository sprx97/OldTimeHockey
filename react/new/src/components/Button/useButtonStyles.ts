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
  const {
    theme,
    getHeaderBackgroundColor,
    getAccessibleLinkColor,
    getAccessibleActiveLinkColor,
  } = useTheme()

  const styles = useMemo(() => {
    const baseStyle: CSSPropertiesWithVars = {
      ...(style as CSSPropertiesWithVars),
    }

    const headerBgColor = getHeaderBackgroundColor()
    const linkColor = getAccessibleLinkColor()
    const activeLinkColor = getAccessibleActiveLinkColor()

    if (variant === 'primary') {
      const bgColor =
        theme.type === 'team' && theme.team ? headerBgColor : '#000'

      baseStyle.backgroundColor = bgColor
      baseStyle.color = linkColor
      baseStyle.border = 'none'
      baseStyle['--hover-bg-color'] = activeLinkColor
      baseStyle['--hover-text-color'] = '#fff'
      baseStyle['--primary-color'] = activeLinkColor
    } else if (variant === 'secondary') {
      const borderColor =
        theme.type === 'team' && theme.team ? headerBgColor : '#000'
      const textColor =
        theme.type === 'team' && theme.team ? headerBgColor : '#000'

      baseStyle.backgroundColor = '#fff'
      baseStyle.color = textColor
      baseStyle.border = `1px solid ${borderColor}`
      baseStyle['--hover-bg-color'] = activeLinkColor
      baseStyle['--hover-text-color'] = '#fff'
      baseStyle['--hover-border-color'] = activeLinkColor
      baseStyle['--primary-color'] = activeLinkColor
    } else if (variant === 'text') {
      const textColor =
        theme.type === 'team' && theme.team ? headerBgColor : '#000'

      baseStyle.color = textColor
      baseStyle['--hover-text-color'] = activeLinkColor
      baseStyle['--primary-color'] = activeLinkColor
    }

    return baseStyle
  }, [
    variant,
    style,
    theme,
    getHeaderBackgroundColor,
    getAccessibleLinkColor,
    getAccessibleActiveLinkColor,
  ])

  return useMemo(
    () => ({
      styles,
      className: variant,
    }),
    [styles, variant]
  )
}
