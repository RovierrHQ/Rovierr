import { createBasicAuthClient } from '@rov/auth/client/web'

if (!import.meta.env.VITE_AUTH_SERVER_URL) {
  throw new Error('VITE_AUTH_SERVER_URL is not set')
}

export const authClient = createBasicAuthClient({
  baseURL: import.meta.env.VITE_AUTH_SERVER_URL
})

export type AuthState = ReturnType<typeof authClient.useSession>
