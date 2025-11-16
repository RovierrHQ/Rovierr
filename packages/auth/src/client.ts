/**
 * Client-side auth utilities
 * Re-export web and native clients from separate files
 * This prevents Expo modules from being bundled in web apps
 */

import type { createAuth } from './index'

export type Auth = ReturnType<typeof createAuth>

// Re-export native client (has Expo dependencies)
export {
  createNativeAuthClient,
  type NativeAuthClient,
  type NativeAuthClientConfig
} from './client-native'
// Re-export web clients (no Expo dependencies)
export {
  type BasicAuthClient,
  type BasicAuthClientConfig,
  createBasicAuthClient,
  createWebAuthClient,
  type WebAuthClient,
  type WebAuthClientConfig
} from './client-web'

// Union type for all clients
export type AuthClient =
  | ReturnType<typeof import('./client-web').createWebAuthClient>
  | ReturnType<typeof import('./client-web').createBasicAuthClient>
  | ReturnType<typeof import('./client-native').createNativeAuthClient>
