import { createMiddleware } from '@tanstack/react-start'
import { getRequest, getRequestHeaders } from '@tanstack/react-start/server'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
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

  // const session = await authClient.getSession({ fetchOptions: { headers } });
  // if (!session) {
  //   throw redirect({
  //     to: "/login",
  //     search: { redirectUri: window.location.href },
  //   });
  // }

  return await next()
})
