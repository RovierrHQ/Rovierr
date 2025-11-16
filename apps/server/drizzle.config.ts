/** biome-ignore-all lint/style/noProcessEnv: config file */
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: '../../packages/db/src/schema',
  out: '../../packages/db/src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || ''
  }
})
