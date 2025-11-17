import { createNativeAuthClient } from '@rov/auth/client/native'
import { getItem, setItem } from 'expo-secure-store'

export const authClient = createNativeAuthClient({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL || '',
  storagePrefix: 'rovierr',
  storage: {
    getItem: (key: string) => getItem(key),
    setItem: (key: string, value: string) => setItem(key, value)
  }
})
