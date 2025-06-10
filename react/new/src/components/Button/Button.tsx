import styles from './button.module.scss'
import { ButtonHTMLAttributes, ReactNode, memo, useMemo } from 'react'
import { ButtonVariant, useButtonStyles } from './useButtonStyles'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  className?: string
  children?: ReactNode
}

export const Button = memo(function Button({
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

  const combinedClassName = useMemo(
    () => `${styles[variantClass]} ${className || ''}`,
    [variantClass, className]
  )

  return (
    <button
      className={combinedClassName}
      style={buttonStyles}
      type='button'
      {...props}
    >
      {children}
    </button>
  )
})
