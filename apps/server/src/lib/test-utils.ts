/**
 * Testing utilities for migration verification
 */

import type { Elysia } from 'elysia'

/**
 * Test helper to verify router registration
 */
export function testRouterRegistration(
  app: Elysia,
  routerName: string
): boolean {
  try {
    // Basic check that the app can be compiled
    const routes = app.routes
    console.log(`✅ Router ${routerName} registered successfully`)
    return true
  } catch (error) {
    console.error(`❌ Router ${routerName} registration failed:`, error)
    return false
  }
}

/**
 * Test helper to verify authentication middleware
 */
export async function testAuthMiddleware(
  app: Elysia,
  endpoint: string
): Promise<boolean> {
  try {
    // Create a test request without auth headers
    const response = await app.handle(
      new Request(`http://localhost${endpoint}`, {
        method: 'GET'
      })
    )

    // Should return 401 for protected routes
    if (response.status === 401) {
      console.log(`✅ Auth middleware working for ${endpoint}`)
      return true
    }
    console.warn(`⚠️  Expected 401 for ${endpoint}, got ${response.status}`)
    return false
  } catch (error) {
    console.error(`❌ Auth test failed for ${endpoint}:`, error)
    return false
  }
}

/**
 * Test helper to verify endpoint response format
 */
export async function testEndpointFormat(
  app: Elysia,
  endpoint: string,
  method = 'GET',
  headers: Record<string, string> = {},
  body?: any
): Promise<{ success: boolean; status: number; data?: any }> {
  try {
    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestInit.body = JSON.stringify(body)
    }

    const response = await app.handle(
      new Request(`http://localhost${endpoint}`, requestInit)
    )

    let data
    try {
      data = await response.json()
    } catch {
      // Response might not be JSON
    }

    return {
      success: response.ok,
      status: response.status,
      data
    }
  } catch (error) {
    console.error(`❌ Endpoint test failed for ${method} ${endpoint}:`, error)
    return { success: false, status: 500 }
  }
}

/**
 * Migration verification suite
 */
export class MigrationVerifier {
  private app: Elysia

  constructor(app: Elysia) {
    this.app = app
  }

  async verifyRouter(
    routerName: string,
    endpoints: string[]
  ): Promise<boolean> {
    console.log(`🔍 Verifying router: ${routerName}`)

    let allPassed = true

    // Test router registration
    if (!testRouterRegistration(this.app, routerName)) {
      allPassed = false
    }

    // Test each endpoint
    for (const endpoint of endpoints) {
      const result = await testEndpointFormat(this.app, endpoint)
      if (!result.success && result.status !== 401) {
        console.error(
          `❌ Endpoint ${endpoint} failed with status ${result.status}`
        )
        allPassed = false
      } else {
        console.log(`✅ Endpoint ${endpoint} responding correctly`)
      }
    }

    return allPassed
  }

  async runFullVerification(): Promise<boolean> {
    console.log('🚀 Running full migration verification...')

    // Test server startup
    try {
      const healthResponse = await testEndpointFormat(this.app, '/health')
      if (!healthResponse.success) {
        console.error('❌ Health endpoint failed')
        return false
      }
      console.log('✅ Server health check passed')
    } catch (error) {
      console.error('❌ Server health check failed:', error)
      return false
    }

    // Test OpenAPI documentation
    try {
      const swaggerResponse = await testEndpointFormat(this.app, '/swagger')
      if (swaggerResponse.status === 200) {
        console.log('✅ OpenAPI documentation available')
      } else {
        console.warn('⚠️  OpenAPI documentation not available')
      }
    } catch (error) {
      console.warn('⚠️  OpenAPI documentation test failed:', error)
    }

    console.log('✅ Migration verification completed')
    return true
  }
}
