import { Component, ReactNode, ErrorInfo } from 'react'
import { Box, Text, Button, Stack, Alert } from '@mantine/core'
import { RiAlertLine } from 'react-icons/ri'
import { GrRefresh } from 'react-icons/gr'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  level?: 'app' | 'route' | 'component'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { level = 'component', showDetails = false } = this.props
      const { error, errorInfo } = this.state

      const getErrorMessage = () => {
        switch (level) {
          case 'app':
            return 'Something went wrong with the application. Please try refreshing the page.'
          case 'route':
            return 'This page encountered an error. You can try refreshing or navigate to another page.'
          case 'component':
            return 'This section encountered an error. You can try refreshing the page.'
          default:
            return 'Something went wrong. Please try again.'
        }
      }

      const getActions = () => {
        switch (level) {
          case 'app':
            return (
              <Button
                leftSection={<GrRefresh size={16} />}
                onClick={this.handleReload}
                variant='filled'
              >
                Reload Page
              </Button>
            )
          case 'route':
            return (
              <Stack gap='sm'>
                <Button
                  leftSection={<GrRefresh size={16} />}
                  onClick={this.handleRetry}
                  variant='filled'
                >
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant='outline' size='sm'>
                  Reload Page
                </Button>
              </Stack>
            )
          case 'component':
            return (
              <Button
                leftSection={<GrRefresh size={16} />}
                onClick={this.handleRetry}
                variant='outline'
                size='sm'
              >
                Try Again
              </Button>
            )
          default:
            return null
        }
      }

      return (
        <Box p='xl' style={{ textAlign: 'center' }}>
          <Stack gap='lg' align='center'>
            <RiAlertLine size={48} color='var(--mantine-color-red-6)' />

            <Stack gap='sm' align='center'>
              <Text size='lg' fw={600}>
                Oops! Something went wrong
              </Text>
              <Text size='sm' c='dimmed' style={{ maxWidth: 400 }}>
                {getErrorMessage()}
              </Text>
            </Stack>

            {getActions()}

            {showDetails && error && (
              <Alert
                icon={<RiAlertLine size={16} />}
                title='Error Details'
                color='red'
                variant='light'
                style={{ textAlign: 'left', maxWidth: 600 }}
              >
                <Text size='xs' ff='monospace'>
                  {error.message}
                </Text>
                {errorInfo && (
                  <Text size='xs' ff='monospace' mt='xs' c='dimmed'>
                    {errorInfo.componentStack}
                  </Text>
                )}
              </Alert>
            )}
          </Stack>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
