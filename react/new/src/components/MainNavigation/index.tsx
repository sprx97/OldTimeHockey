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
            style={{
              display: 'block',
              lineHeight: 1,
              padding: '8px 12px',
              borderRadius: 'var(--mantine-radius-sm)',
              textDecoration: 'none',
              color: 'var(--mantine-color-text)',
              fontSize: 'var(--mantine-font-size-sm)',
              fontWeight: 500,
            }}
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
              style={{
                display: 'block',
                lineHeight: 1,
                padding: '8px 12px',
                borderRadius: 'var(--mantine-radius-sm)',
                textDecoration: 'none',
                color: 'var(--mantine-color-text)',
                fontSize: 'var(--mantine-font-size-sm)',
                fontWeight: 500,
              }}
            >
              <Center>
                <span style={{ marginRight: 5 }}>{route.name}</span>
                <IconChevronDown size='0.9rem' stroke={1.5} />
              </Center>
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
        style={{
          display: 'block',
          lineHeight: 1,
          padding: '8px 12px',
          borderRadius: 'var(--mantine-radius-sm)',
          textDecoration: 'none',
          color: 'var(--mantine-color-text)',
          fontSize: 'var(--mantine-font-size-sm)',
          fontWeight: 500,
        }}
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
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              fontSize: 'var(--mantine-font-size-md)',
              padding: 'var(--mantine-spacing-md) var(--mantine-spacing-lg)',
              borderRadius: 'var(--mantine-radius-sm)',
              fontWeight: 500,
              color: 'var(--mantine-color-text)',
              cursor: 'pointer',
              justifyContent: 'space-between',
            }}
          >
            <span>{route.name}</span>
            {isSubmenuOpen ? (
              <IconChevronDown size='1.2rem' stroke={1.5} />
            ) : (
              <IconChevronRight size='1.2rem' stroke={1.5} />
            )}
          </Box>
          <Box
            style={{
              height: isSubmenuOpen ? 'auto' : 0,
              overflow: 'hidden',
              transition: 'height 300ms ease',
            }}
          >
            {route.anchors.map((anchor) => (
              <Link
                key={`${route.path}${anchor.path}`}
                to={route.path + anchor.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  fontSize: 'var(--mantine-font-size-md)',
                  padding:
                    'var(--mantine-spacing-md) var(--mantine-spacing-lg)',
                  borderRadius: 'var(--mantine-radius-sm)',
                  fontWeight: 500,
                  color: 'var(--mantine-color-text)',
                  textDecoration: 'none',
                }}
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
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          fontSize: 'var(--mantine-font-size-md)',
          padding: 'var(--mantine-spacing-md) var(--mantine-spacing-lg)',
          borderRadius: 'var(--mantine-radius-sm)',
          fontWeight: 500,
          color: 'var(--mantine-color-text)',
          textDecoration: 'none',
        }}
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
      component='header'
      style={{
        height: '100%',
        padding: '0 var(--mantine-spacing-md)',
      }}
    >
      <Container size='md'>
        <Box
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>OldTimeHockey!</div>
          <Group gap={5} visibleFrom='sm'>
            {navigationItems}
          </Group>
          <Group gap='sm'>
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
                  <Center
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--mantine-radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
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
                  <Center
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--mantine-radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
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
            />
          </Group>
        </Box>
      </Container>
      <Box
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
          transition: 'transform 300ms ease',
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
