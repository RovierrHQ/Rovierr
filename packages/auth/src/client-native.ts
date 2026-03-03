/**
 * Native client-side auth utilities
 * Separate file to isolate Expo dependencies
 */

import { expoClient } from '@better-auth/expo/client'
import {
  customSessionClient,
  emailOTPClient,
  inferOrgAdditionalFields,
  organizationClient,
  phoneNumberClient,
  twoFactorClient,
  usernameClient
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { Auth } from './index'
import { ac } from './permissions'

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
  scheme: string
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
        scheme: config.scheme,
        storage: config.storage
      }),
      emailOTPClient(),
      organizationClient({
        ac,
        teams: {
          enabled: true
        },
        dynamicAccessControl: {
          enabled: true
        },
        schema: inferOrgAdditionalFields<Auth>()
      }),
      phoneNumberClient(),
      twoFactorClient(),
      usernameClient(),
      customSessionClient<Auth>()
    ]
  })
}

// Type utilities
export type NativeAuthClient = ReturnType<typeof createNativeAuthClient>
