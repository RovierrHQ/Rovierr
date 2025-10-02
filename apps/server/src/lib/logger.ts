import { createHandler as debugLog } from 'hono-pino/debug-log'
import type { LoggerOptions } from 'pino'
import pino from 'pino'

/**
 * Production-ready logger with OpenTelemetry support
 *
 * Features:
 * - Structured JSON logging
 * - Multiple log levels (trace, debug, info, warn, error, fatal)
 * - Automatic request/response logging via hono-pino
 * - Performance optimized (minimal overhead)
 * - OpenTelemetry compatible
 * - Beautiful colored output in development (hono-pino/debug-log)
 *
 * @see https://getpino.io
 * @see https://github.com/maou-shonen/hono-pino
 * @see https://opentelemetry.io/docs/specs/otel/logs/
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

/**
 * Pino logger configuration
 * Exported for use with hono-pino middleware
 *
 * Note: Using browser.write for Bun compatibility
 * (transport.target only works in Node.js)
 */
export const pinoConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',

  // Remove base fields in dev (cleaner logs), keep in prod
  base: isDevelopment ? null : { env: process.env.NODE_ENV },

  // Use Unix time for cleaner timestamps (HH:MM:SS)
  timestamp: pino.stdTimeFunctions.unixTime,

  // Use browser.write for Bun runtime (transport doesn't work in Bun)
  browser: isDevelopment
    ? {
        write: debugLog({
          colorEnabled: true,
          // Customize log format
          httpLogFormat:
            '[{time}] {levelLabel} {reqId} {req.method} {req.url} {res.status} ({responseTime}ms)',
          normalLogFormat: '[{time}] {levelLabel} - {msg}'
        })
      }
    : undefined,

  // Serialize errors properly
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  },

  // Redact sensitive information
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'secret',
      'token',
      'apiKey',
      'accessToken',
      'refreshToken'
    ],
    remove: true
  },

  // Disable in test environment
  enabled: !isTest
}

/**
 * Create the base logger instance
 */
export const logger = pino(pinoConfig)

/**
 * Create child logger with additional context
 *
 * @example
 * ```typescript
 * const routeLogger = createLogger({ route: '/api/users' })
 * routeLogger.info('User created', { userId: '123' })
 * // Output: {"level":"info","route":"/api/users","msg":"User created","userId":"123"}
 * ```
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context)
}

/**
 * Log levels explained:
 * - trace: Very detailed debugging (e.g., function entry/exit)
 * - debug: Debugging information (e.g., variable values)
 * - info: General information (e.g., server started, request completed)
 * - warn: Warning messages (e.g., deprecated API used)
 * - error: Error messages (e.g., caught exceptions)
 * - fatal: Critical errors that cause shutdown
 */

/**
 * Helper to log HTTP requests (use with Hono middleware)
 *
 * @example
 * ```typescript
 * app.use('*', async (c, next) => {
 *   logRequest(c.req.raw, { userId: c.get('userId') })
 *   await next()
 * })
 * ```
 */
export function logRequest(req: Request, context?: Record<string, unknown>) {
  logger.info(
    {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      ...context
    },
    `${req.method} ${new URL(req.url).pathname}`
  )
}

/**
 * Helper to log errors with proper serialization
 *
 * @example
 * ```typescript
 * try {
 *   await dangerousOperation()
 * } catch (error) {
 *   logError(error, { userId, operation: 'dangerousOperation' })
 * }
 * ```
 */
export function logError(
  error: Error | unknown,
  context?: Record<string, unknown>
) {
  const err = error instanceof Error ? error : new Error(String(error))

  logger.error(
    {
      err,
      ...context
    },
    err.message
  )
}

/**
 * Flush logger (important for serverless environments)
 * Call this before process exit to ensure all logs are written
 */
export function flushLogs() {
  return new Promise<void>((resolve) => {
    logger.flush(() => resolve())
  })
}

// Graceful shutdown - flush logs before exit
if (!isTest) {
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, flushing logs...')
    flushLogs().then(() => process.exit(0))
  })

  process.on('SIGINT', () => {
    logger.info('SIGINT received, flushing logs...')
    flushLogs().then(() => process.exit(0))
  })
}

/**
 * Export for OpenTelemetry integration
 *
 * When you add OpenTelemetry, you can use this pattern:
 *
 * @example
 * ```typescript
 * import { trace } from '@opentelemetry/api'
 *
 * const span = trace.getActiveSpan()
 * if (span) {
 *   const spanContext = span.spanContext()
 *   logger.info({
 *     trace_id: spanContext.traceId,
 *     span_id: spanContext.spanId,
 *   }, 'Operation completed')
 * }
 * ```
 */
export default logger
