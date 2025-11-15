import { z } from 'zod'

/**
 * Environment variable schema with validation
 *
 * Benefits:
 * - Type-safe environment variables
 * - Clear error messages showing exactly what's missing
 * - Validates at startup, not runtime
 * - Distinguishes between required and optional vars
 * - Auto-complete in IDE
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Logging
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info')
    .describe('Logging level (default: info)'),

  // Server
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.url().describe('PostgreSQL connection string'),
  DATABASE_URL_POOLER: z
    .url()
    .optional()
    .describe('PostgreSQL pooler connection string (optional)'),

  // CORS
  CORS_ORIGIN: z
    .string()
    .min(1)
    .describe('Comma-separated list of allowed origins'),

  // Authentication (Better Auth)
  BETTER_AUTH_SECRET: z
    .string()
    .min(32)
    .describe('Secret key for Better Auth (min 32 chars)'),
  SERVER_URL: z.url().describe('Base URL for Better Auth'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1).describe('Google OAuth Client ID'),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1)
    .describe('Google OAuth Client Secret'),

  // Centrifugo (Real-time)
  CENTRIFUGO_URL: z
    .url()
    .optional()
    .describe('Centrifugo server URL (optional for real-time features)'),
  CENTRIFUGO_API_KEY: z
    .string()
    .optional()
    .describe('Centrifugo API key for server-side publishing'),
  CENTRIFUGO_HMAC_SECRET_KEY: z
    .string()
    .min(32)
    .optional()
    .describe(
      'HMAC secret for signing Centrifugo connection tokens (min 32 chars)'
    ),

  // Email (UseSend)
  USESEND_API_KEY: z
    .string()
    .min(1)
    .describe('Usesend API key for sending emails'),

  // Analytics (PostHog)
  POSTHOG_API_KEY: z.string().min(1).describe('PostHog API key for analytics'),
  POSTHOG_HOST: z
    .url()
    .default('https://app.posthog.com')
    .describe('PostHog host URL')
})

/**
 * Validate and parse environment variables
 *
 * This will throw a clear error at startup if any required env vars are missing
 * or if any vars don't meet the validation criteria
 *
 * @remarks
 * This function runs ONLY ONCE when the module is first imported (at server startup).
 * Node.js caches the module, so subsequent imports reuse the validated env object.
 * This means zero performance impact on API requests.
 */
function validateEnv() {
  try {
    const validated = envSchema.parse(process.env)
    return validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Use console here since logger isn't available yet during env validation
      console.error('\n❌ Environment validation failed:\n')

      for (const issue of error.issues) {
        const path = issue.path.join('.')
        console.error(`  • ${path}: ${issue.message}`)

        // Show description if available
        const field = envSchema.shape[path as keyof typeof envSchema.shape]
        if (field?.description) {
          console.error(`    → ${field.description}`)
        }
      }

      console.error(
        '\nPlease check your .env file and ensure all required variables are set.\n'
      )
      process.exit(1)
    }
    throw error
  }
}

/**
 * Validated and type-safe environment variables
 *
 * Usage:
 * ```typescript
 * import { env } from './lib/env'
 *
 * const dbUrl = env.DATABASE_URL // string (guaranteed to exist)
 * const pooler = env.DATABASE_URL_POOLER // string | undefined
 * ```
 */
const validatedEnv = validateEnv()
export const env = {
  ...validatedEnv,
  BETTER_AUTH_API_URL: `${validatedEnv.SERVER_URL}/api/auth`
}

/**
 * Type helper for environment variables
 */
export type Env = z.infer<typeof envSchema> & { BETTER_AUTH_API_URL: string }
