import {
  useState,
  KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  memo,
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import styles from './themeToggle.module.scss'

interface ThemeToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export const ThemeToggle = memo(function ThemeToggle({
  checked,
  onChange,
}: ThemeToggleProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [visualState, setVisualState] = useState(checked)
  const animationTimeoutRef = useRef<number | null>(null)

  const handleToggle = useCallback(() => {
    if (!isAnimating) {
      const newChecked = !checked

      setVisualState(newChecked)
      setIsAnimating(true)

      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
      animationTimeoutRef.current = setTimeout(() => {
        onChange(newChecked)
        setIsAnimating(false)
        animationTimeoutRef.current = null
      }, 250)
    }
  }, [checked, onChange, isAnimating])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleToggle()
      }
    },
    [handleToggle]
  )

  const handleFocus = useCallback(() => setIsFocused(true), [])
  const handleBlur = useCallback(() => setIsFocused(false), [])

  const className = useMemo(() => {
    const classes = [styles.themeToggle]
    if (visualState) classes.push(styles.checked)
    if (isFocused) classes.push(styles.focused)
    if (isAnimating) classes.push(styles.animating)
    return classes.join(' ')
  }, [visualState, isFocused, isAnimating])

  return (
    <div
      className={className}
      role='switch'
      aria-checked={visualState}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className={styles.toggleTrack}>
        <div className={styles.toggleThumb}>
          <FontAwesomeIcon icon={faSun} className={styles.sunIcon} />
          <FontAwesomeIcon icon={faMoon} className={styles.moonIcon} />
        </div>
      </div>
    </div>
  )
})
