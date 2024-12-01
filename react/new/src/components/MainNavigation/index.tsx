import {
  Menu,
  Group,
  Center,
  Burger,
  Container,
  Switch,
  useMantineColorScheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconChevronDown,
  IconChevronRight,
  IconSettings,
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import classes from './main-navigation.module.scss'
import routes from '../../routes'

interface RouteWithAnchors {
  path: string
  name: string
  anchors?: { path: string; name: string }[]
}

function MainNavigation() {
  const [opened, { toggle, close }] = useDisclosure(false)
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const [openSubmenuIds, setOpenSubmenuIds] = useState<string[]>([])

  const handleThemeToggle = (checked: boolean) => {
    setColorScheme(checked ? 'dark' : 'light')
  }

  const toggleSubmenu = (path: string) => {
    setOpenSubmenuIds((prev) =>
      prev.includes(path) ? prev.filter((id) => id !== path) : [...prev, path]
    )
  }

  const renderMenuItem = (route: RouteWithAnchors) => {
    if (route.anchors) {
      const submenuItems = route.anchors.map((anchor) => (
        <Menu.Item key={anchor.path}>
          <Link to={route.path + anchor.path} className={classes.link}>
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
            <Link to={route.path} className={classes.link}>
              <Center>
                <span className={classes.linkLabel}>{route.name}</span>
                <IconChevronDown size='0.9rem' stroke={1.5} />
              </Center>
            </Link>
          </Menu.Target>
          <Menu.Dropdown>{submenuItems}</Menu.Dropdown>
        </Menu>
      )
    } else {
      return (
        <Link key={route.path} to={route.path} className={classes.link}>
          {route.name}
        </Link>
      )
    }
  }

  const renderMobileMenuItem = (route: RouteWithAnchors) => {
    const isSubmenuOpen = openSubmenuIds.includes(route.path)

    if (route.anchors) {
      return (
        <div key={route.path}>
          <div
            className={`${classes.mobileLink} ${classes.hasChildren}`}
            onClick={() => toggleSubmenu(route.path)}
          >
            <span>{route.name}</span>
            {isSubmenuOpen ? (
              <IconChevronDown size='1.2rem' stroke={1.5} />
            ) : (
              <IconChevronRight size='1.2rem' stroke={1.5} />
            )}
          </div>
          <div
            className={`${classes.mobileSubmenu} ${isSubmenuOpen ? classes.opened : ''}`}
          >
            {route.anchors.map((anchor) => (
              <Link
                key={`${route.path}${anchor.path}`}
                to={route.path + anchor.path}
                className={classes.mobileLink}
                onClick={() => {
                  close()
                  setOpenSubmenuIds([])
                }}
              >
                {anchor.name}
              </Link>
            ))}
          </div>
        </div>
      )
    }
    return (
      <Link
        key={route.path}
        to={route.path}
        className={classes.mobileLink}
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
    <header className={classes.header}>
      <Container size='md'>
        <div className={classes.inner}>
          <div>OldTimeHockey!</div>
          <Group gap={5} visibleFrom='sm'>
            {navigationItems}
          </Group>
          <div className={classes.rightGroup}>
            <div className={classes.settingsMenu}>
              <Menu
                trigger='hover'
                transitionProps={{ exitDuration: 0 }}
                withinPortal
                position='bottom-end'
              >
                <Menu.Target>
                  <Center
                    className={classes.link}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconSettings size='1.2rem' stroke={1.5} />
                  </Center>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Theme Settings</Menu.Label>
                  <div className={classes.themeControls}>
                    <Switch
                      checked={colorScheme === 'dark'}
                      onChange={(event) =>
                        handleThemeToggle(event.currentTarget.checked)
                      }
                      label='Dark mode'
                    />
                  </div>
                </Menu.Dropdown>
              </Menu>
            </div>
            <div className={classes.burgerWrapper}>
              <Burger
                opened={opened}
                onClick={() => {
                  toggle()
                  setOpenSubmenuIds([])
                }}
                size='sm'
                hiddenFrom='sm'
                className={classes.burger}
              />
            </div>
          </div>
        </div>
      </Container>
      <div className={`${classes.mobileMenu} ${opened ? classes.opened : ''}`}>
        {mobileNavigationItems}
      </div>
    </header>
  )
}

export default MainNavigation
