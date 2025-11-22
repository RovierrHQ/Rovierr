/**
 * Web client-side auth utilities
 * Separate file to avoid bundling Expo modules in web apps
 */

import {
  emailOTPClient,
  inferOrgAdditionalFields,
  oneTapClient,
  organizationClient,
  phoneNumberClient,
  twoFactorClient,
  usernameClient
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { Auth } from './index'
import { ac } from './permissions'

/**
 * Web Auth Client Configuration
 */
export interface WebAuthClientConfig {
  baseURL: string
  googleClientId: string
  oneTapOptions?: {
    autoSelect?: boolean
    cancelOnTapOutside?: boolean
    context?: 'signin' | 'signup' | 'use'
    promptOptions?: {
      baseDelay?: number
      maxAttempts?: number
    }
    additionalOptions?: Record<string, unknown>
  }
}

/**
 * Create a web auth client with all web-specific plugins
 * Use this for Next.js, Vite, and other web apps
 */
export function createWebAuthClient(config: WebAuthClientConfig) {
  return createAuthClient({
    baseURL: config.baseURL,
    plugins: [
      emailOTPClient(),
      oneTapClient({
        clientId: config.googleClientId,
        autoSelect: false,
        cancelOnTapOutside: true,
        context: 'signin',
        promptOptions: {
          baseDelay: 1000,
          maxAttempts: 5
        },
        ...config.oneTapOptions
      }),
      organizationClient({
        ac,

        dynamicAccessControl: {
          enabled: true
        },
        schema: inferOrgAdditionalFields<Auth>()
      }),
      phoneNumberClient(),
      twoFactorClient(),
      usernameClient()
    ]
  })
}

/**
 * Basic Auth Client Configuration
 */
export interface BasicAuthClientConfig {
  baseURL: string
}

/**
 * Create a basic auth client
 * Use this for desktop apps or minimal web apps without extra plugins
 */
export function createBasicAuthClient(config: BasicAuthClientConfig) {
  return createAuthClient({
    baseURL: config.baseURL
  })
}

// Type utilities
export type WebAuthClient = ReturnType<typeof createWebAuthClient>
export type BasicAuthClient = ReturnType<typeof createBasicAuthClient>
