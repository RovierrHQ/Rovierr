import { createNativeAuthClient } from '@rov/auth/client/native'
import * as SecureStore from 'expo-secure-store'

export const authClient = createNativeAuthClient({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL || '',
  storagePrefix: 'rovierr',
  storage: {
    getItem: (key: string) => SecureStore.getItem(key),
    setItem: (key: string, value: string) => SecureStore.setItem(key, value)
  }
})
