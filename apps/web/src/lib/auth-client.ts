import { createWebAuthClient } from '@rov/auth/client/web'

if (!process.env.NEXT_PUBLIC_SERVER_URL) {
  throw new Error('NEXT_PUBLIC_SERVER_URL is not set')
}

if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set')
}

export const authClient = createWebAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
})
