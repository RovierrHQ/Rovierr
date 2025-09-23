import { initAuthClient } from '@rov/auth'

if (!process.env.NEXT_PUBLIC_SERVER_URL) {
  throw new Error('NEXT_PUBLIC_SERVER_URL is not set')
}

export const authClient = initAuthClient(process.env.NEXT_PUBLIC_SERVER_URL)
