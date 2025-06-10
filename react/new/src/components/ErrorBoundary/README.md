# Error Boundary Implementation

This directory contains a comprehensive error boundary system for the React application, providing robust error handling at multiple levels.

## Components

### 1. ErrorBoundary (Base Component)
**File:** `ErrorBoundary.tsx`

The main error boundary component that catches JavaScript errors anywhere in the child component tree.

**Features:**
- Configurable error levels (app, route, component)
- Custom fallback UI based on error level
- Error logging in development mode
- Retry functionality
- Optional error details display
- Custom error handlers

**Props:**
- `children`: ReactNode - Components to wrap
- `fallback?`: ReactNode - Custom fallback UI
- `onError?`: Function - Custom error handler
- `showDetails?`: boolean - Show error details (default: false)
- `level?`: 'app' | 'route' | 'component' - Error boundary level

### 2. RouteErrorBoundary
**File:** `RouteErrorBoundary.tsx`

Specialized error boundary for route-level error handling.

**Features:**
- Route-specific error logging
- Automatic route name detection
- Optimized for page-level errors

**Props:**
- `children`: ReactNode - Route components to wrap
- `routeName?`: string - Optional route name for logging

### 3. ThemeErrorBoundary
**File:** `ThemeErrorBoundary.tsx`

Specialized error boundary for theme system errors.

**Features:**
- Theme-specific error handling
- Automatic localStorage cleanup on errors
- Custom fallback UI for theme errors
- Theme reset functionality

**Props:**
- `children`: ReactNode - Theme-related components to wrap

## Implementation Strategy

### Error Boundary Hierarchy

```
App (Top-level ErrorBoundary)
├── BrowserRouter
    ├── ThemeErrorBoundary
        ├── ThemeProvider
            ├── AppShell
                ├── Header (Component-level ErrorBoundary)
                │   └── MainNavigation
                └── Main (Route-level ErrorBoundary)
                    └── Routes
                        └── Individual Routes (RouteErrorBoundary)
```

### Error Levels

1. **App Level**: Catches catastrophic errors that would crash the entire application
2. **Route Level**: Isolates errors to specific pages, allowing navigation to other pages
3. **Component Level**: Isolates errors to specific UI sections

## Usage Examples

### Basic Usage
```tsx
import ErrorBoundary from '@/components/ErrorBoundary'

<ErrorBoundary level="component">
  <MyComponent />
</ErrorBoundary>
```

### Route Usage
```tsx
import RouteErrorBoundary from '@/components/ErrorBoundary/RouteErrorBoundary'

<RouteErrorBoundary routeName="Dashboard">
  <DashboardPage />
</RouteErrorBoundary>
```

### Theme Usage
```tsx
import ThemeErrorBoundary from '@/components/ErrorBoundary/ThemeErrorBoundary'

<ThemeErrorBoundary>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</ThemeErrorBoundary>
```

### Custom Error Handler
```tsx
<ErrorBoundary 
  level="component"
  onError={(error, errorInfo) => {
    // Custom error handling logic
    console.error('Custom handler:', error)
  }}
>
  <MyComponent />
</ErrorBoundary>
```

## Error Handling Hook

### useErrorHandler
**File:** `@/hooks/useErrorHandler.ts`

A custom hook for handling async errors in functional components.

**Features:**
- Async error handling
- Function wrapping for automatic error catching
- Configurable error logging
- Custom error handlers

**Usage:**
```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler'

const MyComponent = () => {
  const { handleAsyncError, wrapAsync } = useErrorHandler({
    onError: (error) => console.error('Custom error:', error)
  })

  const fetchData = wrapAsync(async () => {
    const response = await fetch('/api/data')
    return response.json()
  }, 'fetchData')

  // Or use handleAsyncError directly
  const handleClick = async () => {
    const result = await handleAsyncError(
      () => fetch('/api/action'),
      'handleClick'
    )
  }
}
```

## Best Practices

1. **Granular Error Boundaries**: Place error boundaries at appropriate levels to isolate errors
2. **Meaningful Error Messages**: Provide user-friendly error messages based on context
3. **Error Logging**: Always log errors in development, consider error reporting services in production
4. **Recovery Options**: Provide retry mechanisms where appropriate
5. **Fallback UIs**: Design fallback UIs that maintain the application's visual consistency

## Error Recovery Strategies

1. **Component Level**: Retry button to re-render the component
2. **Route Level**: Navigation options to other pages + retry
3. **App Level**: Full page reload as last resort
4. **Theme Level**: Reset theme settings and reload

## Development vs Production

- **Development**: Show detailed error information for debugging
- **Production**: Show user-friendly messages, hide technical details
- **Logging**: Console logging in development, external services in production

## Future Enhancements

1. **Error Reporting Integration**: Add services like Sentry or Bugsnag
2. **Error Analytics**: Track error patterns and frequencies
3. **User Feedback**: Allow users to report errors with context
4. **Automatic Recovery**: Implement smart retry mechanisms
5. **Error Boundaries for Suspense**: Handle loading and error states together
