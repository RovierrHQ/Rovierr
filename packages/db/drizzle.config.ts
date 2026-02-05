import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Try to load .env from various locations
const envPaths = ['.env']

for (const path of envPaths) {
  try {
    dotenv.config({ path })
    break
  } catch {
    // Continue to next path
  }
}

export default defineConfig({
  schema: './src/schema',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || ''
  }
})
