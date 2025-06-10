import styles from './button.module.scss'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { ButtonVariant, useButtonStyles } from './useButtonStyles'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  className?: string
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  className,
  style,
  children,
  ...props
}: ButtonProps) {
  const { styles: buttonStyles, className: variantClass } = useButtonStyles(
    variant,
    style
  )

  return (
    <button
      className={`${styles[variantClass]} ${className || ''}`}
      style={buttonStyles}
      type='button'
      {...props}
    >
      {children}
    </button>
  )
}
