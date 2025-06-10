import { ReactNode } from 'react'
import ErrorBoundary from './ErrorBoundary'
import { Box, Text, Button, Stack } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'

interface ThemeErrorBoundaryProps {
  children: ReactNode
}

const ThemeErrorFallback = () => {
  const handleReload = () => {
    // Clear theme-related localStorage before reload
    try {
      localStorage.removeItem('oth-color-scheme')
      localStorage.removeItem('oth-team-theme')
      localStorage.removeItem('oth-theme-type')
    } catch {
      // Silently fail if localStorage is not available
    }
    window.location.reload()
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Stack gap='lg' align='center' style={{ maxWidth: 400 }}>
        <Text size='xl' fw={600} ta='center'>
          Theme System Error
        </Text>
        <Text size='sm' c='dimmed' ta='center'>
          There was an error loading the theme system. This might be due to
          corrupted theme settings. Click below to reset and reload.
        </Text>
        <Button
          leftSection={<IconRefresh size={16} />}
          onClick={handleReload}
          variant='filled'
        >
          Reset Theme & Reload
        </Button>
      </Stack>
    </Box>
  )
}

const ThemeErrorBoundary = ({ children }: ThemeErrorBoundaryProps) => {
  const handleError = (error: Error) => {
    console.error('Theme system error:', error)

    try {
      localStorage.removeItem('oth-color-scheme')
      localStorage.removeItem('oth-team-theme')
      localStorage.removeItem('oth-theme-type')
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  return (
    <ErrorBoundary
      fallback={<ThemeErrorFallback />}
      onError={handleError}
      level='app'
    >
      {children}
    </ErrorBoundary>
  )
}

export default ThemeErrorBoundary
