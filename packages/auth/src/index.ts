import type { BetterAuthClientPlugin } from 'better-auth'
import { createAuthClient } from 'better-auth/react'

export const initAuthClient = (
  baseURL: string,
  plugins?: BetterAuthClientPlugin[]
) =>
  createAuthClient({
    baseURL,
    plugins: [...(plugins || [])]
  })

export type AuthClient = ReturnType<typeof initAuthClient>
