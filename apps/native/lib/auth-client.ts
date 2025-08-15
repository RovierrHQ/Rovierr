import { expoClient } from '@better-auth/expo/client'
import { createAuthClient } from 'better-auth/react'
import { getItem, setItem } from 'expo-secure-store'

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  plugins: [
    expoClient({
      storagePrefix: 'rovierr',
      storage: {
        getItem,
        setItem
      }
    })
  ]
})
