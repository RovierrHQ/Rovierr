/**
 * Native client-side auth utilities
 * Separate file to isolate Expo dependencies
 */

import { expoClient } from '@better-auth/expo/client'
import { createAuthClient } from 'better-auth/react'

/**
 * Native Auth Client Configuration
 */
export type NativeAuthClientConfig = {
  baseURL: string
  storagePrefix?: string
  storage: {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
  }
}

/**
 * Create a native auth client for Expo/React Native apps
 * Use this for mobile apps with expo-secure-store
 */
export function createNativeAuthClient(config: NativeAuthClientConfig) {
  return createAuthClient({
    baseURL: config.baseURL,
    plugins: [
      expoClient({
        storagePrefix: config.storagePrefix || 'rovierr',
        scheme: 'rovierr',
        storage: config.storage
      })
    ]
  })
}

// Type utilities
export type NativeAuthClient = ReturnType<typeof createNativeAuthClient>
