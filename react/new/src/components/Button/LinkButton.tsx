import { useTheme } from '../../contexts/ThemeContext'
import styles from './button.module.scss'
import { AnchorHTMLAttributes, CSSProperties, ReactNode } from 'react'

export type LinkButtonVariant = 'primary' | 'secondary' | 'text'

export interface LinkButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkButtonVariant
  className?: string
  style?: CSSProperties
  children?: ReactNode
  href: string
}

type CSSPropertiesWithVars = CSSProperties & {
  [key: `--${string}`]: string
}

export function LinkButton({
  variant = 'primary',
  className,
  style,
  children,
  href,
  ...props
}: LinkButtonProps) {
  const {
    theme,
    getHeaderBackgroundColor,
    getAccessibleLinkColor,
    getAccessibleActiveLinkColor,
  } = useTheme()

  const getLinkStyles = () => {
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

  return (
    <a
      className={`${styles[variant]} ${className || ''}`}
      style={getLinkStyles()}
      href={href}
      {...props}
    >
      {children}
    </a>
  )
}
