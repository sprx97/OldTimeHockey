import './App.css'
import '@mantine/core/styles.css'
import { MantineProvider, AppShell } from '@mantine/core'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import routes from './routes'
import MainNavigation from './components/MainNavigation'

function App() {
  return (
    <BrowserRouter>
      <MantineProvider>
        <AppShell header={{ height: 60 }} padding='sm' withBorder={false}>
          <AppShell.Header>
            <MainNavigation />
          </AppShell.Header>
          <AppShell.Main>
            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </BrowserRouter>
  )
}

export default App
