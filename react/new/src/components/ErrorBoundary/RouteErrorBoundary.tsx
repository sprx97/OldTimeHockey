import { ReactNode } from 'react'
import ErrorBoundary from './ErrorBoundary'
import { useLocation } from 'react-router-dom'

interface RouteErrorBoundaryProps {
  children: ReactNode
  routeName?: string
}

const RouteErrorBoundary = ({
  children,
  routeName,
}: RouteErrorBoundaryProps) => {
  const location = useLocation()

  const handleError = (error: Error) => {
    console.error(`Error in route: ${routeName || location.pathname}`, error)
  }

  return (
    <ErrorBoundary
      level='route'
      showDetails={import.meta.env.DEV}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}

export default RouteErrorBoundary
