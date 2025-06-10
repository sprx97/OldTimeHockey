import { useTheme } from '../../contexts/ThemeContext'
import styles from './button.module.scss'
import { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'text'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type CSSPropertiesWithVars = CSSProperties & {
  [key: `--${string}`]: string
}

export function Button({
  variant = 'primary',
  className,
  style,
  children,
  ...props
}: ButtonProps) {
  const {
    theme,
    getHeaderBackgroundColor,
    getLinkHoverColor,
    getAccessibleLinkColor,
  } = useTheme()

  const getButtonStyles = () => {
    const baseStyle: CSSPropertiesWithVars = {
      ...(style as CSSPropertiesWithVars),
    }

    if (variant === 'primary') {
      const bgColor =
        theme.type === 'team' && theme.team
          ? getHeaderBackgroundColor()
          : '#000'

      const textColor = getAccessibleLinkColor()
      const hoverColor = getLinkHoverColor()

      baseStyle.backgroundColor = bgColor
      baseStyle.color = textColor
      baseStyle.border = 'none'

      baseStyle['--hover-bg-color'] = hoverColor
      baseStyle['--hover-text-color'] = '#fff'
    } else if (variant === 'secondary') {
      const borderColor =
        theme.type === 'team' && theme.team
          ? getHeaderBackgroundColor()
          : '#000'

      const textColor =
        theme.type === 'team' && theme.team
          ? getHeaderBackgroundColor()
          : '#000'

      const hoverColor = getLinkHoverColor()

      baseStyle.backgroundColor = '#fff'
      baseStyle.color = textColor
      baseStyle.border = `1px solid ${borderColor}`

      baseStyle['--hover-bg-color'] = hoverColor
      baseStyle['--hover-text-color'] = '#fff'
      baseStyle['--hover-border-color'] = hoverColor
    } else if (variant === 'text') {
      const textColor =
        theme.type === 'team' && theme.team
          ? getHeaderBackgroundColor()
          : '#000'

      const hoverColor = getLinkHoverColor()

      baseStyle.color = textColor

      baseStyle['--hover-text-color'] = hoverColor
    }

    return baseStyle
  }

  return (
    <button
      className={`${styles[variant]} ${className || ''}`}
      style={getButtonStyles()}
      type='button'
      {...props}
    >
      {children}
    </button>
  )
}
