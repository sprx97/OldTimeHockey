import { Menu, Group, Center, Burger, Container, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconChevronDown,
  IconChevronRight,
  IconSettings,
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import routes from '../../routes'
import { ThemeControls } from '../ThemeControls'
import whiteLogo from '../../assets/logos/oth-wordmark-white.svg'

interface RouteWithAnchors {
  path: string
  name: string
  anchors?: { path: string; name: string }[]
}

function MainNavigation() {
  const [opened, { toggle, close }] = useDisclosure(false)
  const [openSubmenuIds, setOpenSubmenuIds] = useState<string[]>([])

  const toggleSubmenu = (path: string) => {
    setOpenSubmenuIds((prev) =>
      prev.includes(path) ? prev.filter((id) => id !== path) : [...prev, path]
    )
  }

  const renderMenuItem = (route: RouteWithAnchors) => {
    if (route.anchors) {
      const submenuItems = route.anchors.map((anchor) => (
        <Menu.Item key={anchor.path}>
          <Link
            to={route.path + anchor.path}
            className='nav-link'
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            {anchor.name}
          </Link>
        </Menu.Item>
      ))

      return (
        <Menu
          key={route.path}
          trigger='hover'
          transitionProps={{ exitDuration: 0 }}
          withinPortal
        >
          <Menu.Target>
            <Link
              to={route.path}
              className='nav-link'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                {route.name}{' '}
                <IconChevronDown
                  size='0.9rem'
                  stroke={1.5}
                  style={{ marginLeft: 5 }}
                />
              </span>
            </Link>
          </Menu.Target>
          <Menu.Dropdown>{submenuItems}</Menu.Dropdown>
        </Menu>
      )
    }

    return (
      <Link
        key={route.path}
        to={route.path}
        className='nav-link'
        style={{ display: 'inline-flex', alignItems: 'center', height: '100%' }}
      >
        {route.name}
      </Link>
    )
  }

  const renderMobileMenuItem = (route: RouteWithAnchors) => {
    const isSubmenuOpen = openSubmenuIds.includes(route.path)

    if (route.anchors) {
      return (
        <div key={route.path}>
          <Box
            onClick={() => toggleSubmenu(route.path)}
            className='mobile-menu-toggle'
          >
            <span>{route.name}</span>
            {isSubmenuOpen ? (
              <IconChevronDown size='1.2rem' stroke={1.5} />
            ) : (
              <IconChevronRight size='1.2rem' stroke={1.5} />
            )}
          </Box>
          <Box
            className='submenu-container'
            style={{
              height: isSubmenuOpen ? 'auto' : 0,
            }}
          >
            {route.anchors.map((anchor) => (
              <Link
                key={`${route.path}${anchor.path}`}
                to={route.path + anchor.path}
                className='mobile-nav-link'
                onClick={() => {
                  close()
                  setOpenSubmenuIds([])
                }}
              >
                {anchor.name}
              </Link>
            ))}
          </Box>
        </div>
      )
    }

    return (
      <Link
        key={route.path}
        to={route.path}
        className='mobile-nav-link'
        onClick={() => {
          close()
          setOpenSubmenuIds([])
        }}
      >
        {route.name}
      </Link>
    )
  }

  const navigationItems = routes.map((route) =>
    renderMenuItem(route as RouteWithAnchors)
  )

  const mobileNavigationItems = routes.map((route) =>
    renderMobileMenuItem(route as RouteWithAnchors)
  )

  return (
    <Box
      style={{
        height: '60px',
        padding: '0 var(--mantine-spacing-md)',
        backgroundColor: '#001a36',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
      }}
    >
      <Box size='100%' style={{ width: '100%' }}>
        <Box
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              flex: '0 0 auto',
              marginRight: '20px',
            }}
          >
            <img
              src={whiteLogo}
              alt='OldTimeHockey Logo'
              style={{ height: '28px', width: 'auto' }}
            />
          </div>
          <Box
            style={{
              height: '100%',
              alignItems: 'center',
              flex: '1 1 auto',
              justifyContent: 'flex-end',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
            visibleFrom='sm'
          >
            {navigationItems}
          </Box>
          <Group
            gap='sm'
            style={{
              height: '100%',
              alignItems: 'center',
              flex: '0 1 auto',
              justifyContent: 'flex-end',
            }}
          >
            {/* Desktop Theme Menu */}
            <Box visibleFrom='sm'>
              <Menu
                trigger='hover'
                transitionProps={{ exitDuration: 0 }}
                withinPortal
                position='bottom-end'
                closeOnItemClick={false}
                closeOnClickOutside={false}
                trapFocus={false}
                zIndex={300}
              >
                <Menu.Target>
                  <Center className='settings-icon' style={{ height: '100%' }}>
                    <IconSettings size='1.2rem' stroke={1.5} />
                  </Center>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Theme Settings</Menu.Label>
                  <Box p='xs'>
                    <ThemeControls />
                  </Box>
                </Menu.Dropdown>
              </Menu>
            </Box>
            {/* Mobile Theme Menu */}
            <Box hiddenFrom='sm'>
              <Menu
                trigger='hover'
                transitionProps={{ exitDuration: 0 }}
                withinPortal
                position='bottom-end'
                closeOnItemClick={false}
                closeOnClickOutside={false}
                trapFocus={false}
                zIndex={300}
              >
                <Menu.Target>
                  <Center className='settings-icon' style={{ height: '100%' }}>
                    <IconSettings size='1.2rem' stroke={1.5} />
                  </Center>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Theme Settings</Menu.Label>
                  <Box p='xs'>
                    <ThemeControls />
                  </Box>
                </Menu.Dropdown>
              </Menu>
            </Box>
            <Burger
              opened={opened}
              onClick={() => {
                toggle()
                setOpenSubmenuIds([])
              }}
              size='sm'
              hiddenFrom='sm'
              color='white'
            />
          </Group>
        </Box>
      </Box>
      <Box
        className='mobile-menu'
        style={{
          position: 'fixed',
          top: 60,
          left: 0,
          right: 0,
          bottom: 0,
          padding: 'var(--mantine-spacing-md)',
          backgroundColor: 'var(--mantine-color-body)',
          overflow: 'auto',
          transform: opened ? 'translateX(0)' : 'translateX(100%)',
          zIndex: 100,
        }}
      >
        {mobileNavigationItems}
        <Box
          style={{
            margin: 'var(--mantine-spacing-md) 0',
            borderTop: '1px solid var(--mantine-color-default-border)',
          }}
        />
        <Box p='md'>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--mantine-spacing-sm)',
              fontSize: 'var(--mantine-font-size-lg)',
              fontWeight: 500,
              marginBottom: 'var(--mantine-spacing-md)',
            }}
          >
            <IconSettings size='1.5rem' stroke={1.5} />
            <span>Theme Settings</span>
          </Box>
          <Box px='md'>
            <ThemeControls />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MainNavigation
