import { expoClient } from '@better-auth/expo/client'
import { initAuthClient } from '@rov/auth'
import { getItem, setItem } from 'expo-secure-store'

export const authClient = initAuthClient(
  process.env.EXPO_PUBLIC_SERVER_URL || '',
  [
    expoClient({
      storagePrefix: 'rovierr',
      storage: {
        getItem,
        setItem
      }
    })
  ]
)
