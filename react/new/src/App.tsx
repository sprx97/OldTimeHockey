import './App.css'
import '@mantine/core/styles.css'
import { AppShell } from '@mantine/core'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import routes from '@/routes'
import MainNavigation from '@/components/MainNavigation'
import { ThemeProvider } from '@/contexts/ThemeContext'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppShell header={{ height: 60 }} padding={0} withBorder={false}>
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
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
