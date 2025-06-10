import styles from './button.module.scss'
import { AnchorHTMLAttributes, ReactNode } from 'react'
import { ButtonVariant, useButtonStyles } from './useButtonStyles'

export interface LinkButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant
  className?: string
  children?: ReactNode
  href: string
}

export function LinkButton({
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

  return (
    <a
      className={`${styles[variantClass]} ${className || ''}`}
      style={buttonStyles}
      href={href}
      {...props}
    >
      {children}
    </a>
  )
}
