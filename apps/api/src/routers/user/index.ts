import { Elysia } from 'elysia'
import { profile } from './profile'

// Export the user router as an Elysia instance
export const user = new Elysia({ name: 'user' }).group('/user', (app) =>
  app.use(profile)
)
