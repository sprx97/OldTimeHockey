import './App.css'
import '@mantine/core/styles.css'
import { AppShell } from '@mantine/core'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import routes from '@/routes'
import MainNavigation from '@/components/MainNavigation'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import ThemeErrorBoundary from '@/components/ErrorBoundary/ThemeErrorBoundary'

function App() {
  return (
    <ErrorBoundary level='app' showDetails={import.meta.env.DEV}>
      <BrowserRouter>
        <ThemeErrorBoundary>
          <ThemeProvider>
            <AppShell header={{ height: 60 }} padding={0} withBorder={false}>
              <AppShell.Header>
                <ErrorBoundary level='component'>
                  <MainNavigation />
                </ErrorBoundary>
              </AppShell.Header>
              <AppShell.Main>
                <ErrorBoundary level='route'>
                  <Routes>
                    {routes.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                  </Routes>
                </ErrorBoundary>
              </AppShell.Main>
            </AppShell>
          </ThemeProvider>
        </ThemeErrorBoundary>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
