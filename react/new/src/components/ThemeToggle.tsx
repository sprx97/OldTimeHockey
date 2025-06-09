import { useState, KeyboardEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import styles from './themeToggle.module.scss'

interface ThemeToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ThemeToggle({ checked, onChange }: ThemeToggleProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [localChecked, setLocalChecked] = useState(checked)

  const handleToggle = () => {
    if (!isAnimating) {
      const newChecked = !localChecked
      setIsAnimating(true)
      setLocalChecked(newChecked)
      setTimeout(() => {
        onChange(newChecked)
        setIsAnimating(false)
      }, 500)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <div
      className={`${styles.themeToggle} ${localChecked ? styles.checked : ''} ${isFocused ? styles.focused : ''}`}
      role='switch'
      aria-checked={localChecked}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <div className={styles.toggleTrack}>
        <div className={styles.toggleThumb}>
          <FontAwesomeIcon icon={faSun} className={styles.sunIcon} />
          <FontAwesomeIcon icon={faMoon} className={styles.moonIcon} />
        </div>
      </div>
    </div>
  )
}
