import { createWebAuthClient } from '@rov/auth/client-web'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const authClient = createWebAuthClient({
  baseURL,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
})
