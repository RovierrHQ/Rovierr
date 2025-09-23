import { initAuthClient } from '@rov/auth'

if (!import.meta.env.VITE_AUTH_SERVER_URL) {
  throw new Error('VITE_AUTH_SERVER_URL is not set')
}

export const authClient = initAuthClient(import.meta.env.VITE_AUTH_SERVER_URL)

export type AuthState = ReturnType<typeof authClient.useSession>
