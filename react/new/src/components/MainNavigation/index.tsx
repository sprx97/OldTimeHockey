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
import { IconChevronDown, IconSettings } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import classes from './main-navigation.module.scss'
import routes from '../../routes'

interface RouteWithAnchors {
  path: string
  name: string
  anchors?: { path: string; name: string }[]
}

function MainNavigation() {
  const [opened, { toggle }] = useDisclosure(false)
  const { colorScheme, setColorScheme } = useMantineColorScheme()

  const handleThemeToggle = (checked: boolean) => {
    setColorScheme(checked ? 'dark' : 'light')
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

  const navigationItems = routes.map((route) =>
    renderMenuItem(route as RouteWithAnchors)
  )

  return (
    <header className={classes.header}>
      <Container size='md'>
        <div className={classes.inner}>
          <div>OldTimeHockey!</div>
          <Group gap={5} visibleFrom='sm'>
            {navigationItems}
          </Group>
          <Group gap={5}>
            <Menu
              trigger='hover'
              transitionProps={{ exitDuration: 0 }}
              withinPortal
              position='bottom-end'
            >
              <Menu.Target>
                <Center className={classes.link} style={{ cursor: 'pointer' }}>
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
            <Burger
              opened={opened}
              onClick={toggle}
              size='sm'
              hiddenFrom='sm'
            />
          </Group>
        </div>
      </Container>
    </header>
  )
}

export default MainNavigation
