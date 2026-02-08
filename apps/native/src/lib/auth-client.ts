import { createNativeAuthClient } from '@rov/auth/client-native'
import * as SecureStore from 'expo-secure-store'

// Validate required environment variables
if (!process.env.EXPO_PUBLIC_SERVER_URL) {
  throw new Error(
    'EXPO_PUBLIC_SERVER_URL is not set. Please add it to your .env file.'
  )
}

if (!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error(
    'EXPO_PUBLIC_GOOGLE_CLIENT_ID is not set. Please add it to your .env file.'
  )
}

/**
 * Native auth client configured for Expo/React Native
 * Uses AsyncStorage for secure session persistence
 */
export const authClient = createNativeAuthClient({
  baseURL: `${process.env.EXPO_PUBLIC_SERVER_URL}/api/auth`,
  storagePrefix: 'rovierr',
  storage: SecureStore,
  scheme: 'rovierr'
})

export type AuthClient = typeof authClient
