/**
 * Retry utility with exponential backoff
 */

export class RetryableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RetryableError'
  }
}

export class NonRetryableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NonRetryableError'
  }
}

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  onRetry?: (attempt: number, error: Error) => void
}

/**
 * Execute an operation with retry logic and exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10_000,
    onRetry
  } = options

  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return operation()
    } catch (error) {
      lastError = error as Error

      // Don't retry non-retryable errors
      if (error instanceof NonRetryableError) {
        throw error
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * 2 ** attempt, maxDelay)

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError)
      }

      // biome-ignore lint/nursery/noAwaitInLoop: wait
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), delay)
      })
    }
  }

  throw lastError || new Error('Operation failed after retries')
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  // Network errors
  if (
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('ETIMEDOUT') ||
    error.message.includes('ENOTFOUND')
  ) {
    return true
  }

  // Rate limiting
  if (error.message.includes('rate limit') || error.message.includes('429')) {
    return true
  }

  // Temporary server errors
  if (
    error.message.includes('503') ||
    error.message.includes('502') ||
    error.message.includes('504')
  ) {
    return true
  }

  return false
}
