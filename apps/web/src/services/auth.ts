import { createServerFn } from '@tanstack/react-start'
import { getRequest, getRequestHeaders } from '@tanstack/react-start/server'
import { authClient } from '@web/lib/auth-client'

export const getUserSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    // Get raw request to access cookies directly (works in production on Cloudflare)
    const request = getRequest()
    const requestHeaders = getRequestHeaders()

    // Create new Headers object and copy all headers
    const headers = new Headers()

    if (requestHeaders) {
      for (const [key, value] of requestHeaders.entries()) {
        headers.set(key, value)
      }
    }

    // Explicitly get Cookie header from raw request (critical for production)
    const cookieHeader =
      request?.headers.get('cookie') || request?.headers.get('Cookie')
    if (cookieHeader) {
      headers.set('Cookie', cookieHeader)
    }

    // If no headers and no cookies, return null
    if (headers.keys().next().done && !cookieHeader) {
      return null
    }

    const userSession = await authClient.getSession({
      fetchOptions: {
        headers,
        credentials: 'include'
      }
    })

    if (!(userSession?.data?.user && userSession?.data?.session)) {
      return null
    }

    return { user: userSession.data.user, session: userSession.data.session }
  }
)
