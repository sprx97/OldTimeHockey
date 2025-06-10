import { useState, useCallback, useEffect } from 'react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useLocation } from 'react-router-dom'
import { NAVIGATION_CONSTANTS } from '@/constants/navigation'

export const useNavigationState = () => {
  const [opened, { toggle, close }] = useDisclosure(false)
  const [openSubmenuIds, setOpenSubmenuIds] = useState<string[]>([])
  const location = useLocation()
  const isDesktop = useMediaQuery(
    `(min-width: ${NAVIGATION_CONSTANTS.MOBILE_BREAKPOINT}px)`
  )

  useEffect(() => {
    if (isDesktop && opened) {
      close()
    }
  }, [isDesktop, opened, close])

  const toggleSubmenu = useCallback((path: string) => {
    setOpenSubmenuIds((prev) =>
      prev.includes(path) ? prev.filter((id) => id !== path) : [...prev, path]
    )
  }, [])

  const resetOpenSubmenuIds = useCallback(() => {
    setOpenSubmenuIds([])
  }, [])

  const isCurrentPage = useCallback(
    (path: string) => {
      if (path === '/') {
        return location.pathname === path
      }
      return location.pathname.startsWith(path)
    },
    [location.pathname]
  )

  const handleBurgerClick = useCallback(() => {
    toggle()
    resetOpenSubmenuIds()
  }, [toggle, resetOpenSubmenuIds])

  return {
    // State
    opened,
    openSubmenuIds,
    location,
    isDesktop,
    // Actions
    toggle,
    close,
    toggleSubmenu,
    resetOpenSubmenuIds,
    isCurrentPage,
    handleBurgerClick,
  }
}
