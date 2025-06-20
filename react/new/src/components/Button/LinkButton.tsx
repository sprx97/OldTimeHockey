import styles from './button.module.scss'
import { AnchorHTMLAttributes, ReactNode, memo, useMemo } from 'react'
import { ButtonVariant, useButtonStyles } from './useButtonStyles'

export interface LinkButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant
  className?: string
  children?: ReactNode
  href: string
}

export const LinkButton = memo(function LinkButton({
  variant = 'primary',
  className,
  style,
  children,
  href,
  ...props
}: LinkButtonProps) {
  const { styles: buttonStyles, className: variantClass } = useButtonStyles(
    variant,
    style
  )

  const combinedClassName = useMemo(
    () => `${styles[variantClass]} ${className || ''}`,
    [variantClass, className]
  )

  return (
    <a
      className={combinedClassName}
      style={buttonStyles}
      href={href}
      {...props}
    >
      {children}
    </a>
  )
})
