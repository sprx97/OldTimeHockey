import { CSSProperties } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

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

  const getStyles = () => {
    const baseStyle: CSSPropertiesWithVars = {
      ...(style as CSSPropertiesWithVars),
    }

    if (variant === 'primary') {
      const bgColor =
        theme.type === 'team' && theme.team
          ? getHeaderBackgroundColor()
          : '#000'

      const textColor = getAccessibleLinkColor()
      const hoverColor = getAccessibleActiveLinkColor()

      baseStyle.backgroundColor = bgColor
      baseStyle.color = textColor
      baseStyle.border = 'none'

      baseStyle['--hover-bg-color'] = hoverColor
      baseStyle['--hover-text-color'] = '#fff'
      baseStyle['--primary-color'] = hoverColor
    } else if (variant === 'secondary') {
      const borderColor =
        theme.type === 'team' && theme.team
          ? getHeaderBackgroundColor()
          : '#000'

      const textColor =
        theme.type === 'team' && theme.team
          ? getHeaderBackgroundColor()
          : '#000'

      const hoverColor = getAccessibleActiveLinkColor()

      baseStyle.backgroundColor = '#fff'
      baseStyle.color = textColor
      baseStyle.border = `1px solid ${borderColor}`

      baseStyle['--hover-bg-color'] = hoverColor
      baseStyle['--hover-text-color'] = '#fff'
      baseStyle['--hover-border-color'] = hoverColor
      baseStyle['--primary-color'] = hoverColor
    } else if (variant === 'text') {
      const textColor =
        theme.type === 'team' && theme.team
          ? getHeaderBackgroundColor()
          : '#000'

      const hoverColor = getAccessibleActiveLinkColor()

      baseStyle.color = textColor

      baseStyle['--hover-text-color'] = hoverColor
      baseStyle['--primary-color'] = hoverColor
    }

    return baseStyle
  }

  return {
    styles: getStyles(),
    className: variant,
  }
}
