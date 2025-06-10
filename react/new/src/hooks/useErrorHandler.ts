import { useCallback } from 'react'

interface UseErrorHandlerOptions {
  onError?: (error: Error) => void
  logError?: boolean
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { onError, logError = true } = options

  const handleError = useCallback(
    (error: Error, context?: string) => {
      if (logError) {
        console.error(context ? `Error in ${context}:` : 'Error:', error)
      }

      onError?.(error)
    },
    [onError, logError]
  )

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      context?: string
    ): Promise<T | null> => {
      try {
        return await asyncFn()
      } catch (error) {
        handleError(error as Error, context)
        return null
      }
    },
    [handleError]
  )

  const wrapAsync = useCallback(
    <T extends unknown[], R>(
      fn: (...args: T) => Promise<R>,
      context?: string
    ) => {
      return async (...args: T): Promise<R | null> => {
        try {
          return await fn(...args)
        } catch (error) {
          handleError(error as Error, context)
          return null
        }
      }
    },
    [handleError]
  )

  return {
    handleError,
    handleAsyncError,
    wrapAsync,
  }
}
