if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '') {
  throw new Error('CORS_ORIGIN is not set')
}

if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === '') {
  throw new Error('GOOGLE_CLIENT_ID is not set')
}

if (
  !process.env.GOOGLE_CLIENT_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET === ''
) {
  throw new Error('GOOGLE_CLIENT_SECRET is not set')
}

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET === '') {
  throw new Error('BETTER_AUTH_SECRET is not set')
}

if (!process.env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL === '') {
  throw new Error('BETTER_AUTH_URL is not set')
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_POOLER: process.env.DATABASE_URL_POOLER,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL
}
