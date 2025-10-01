import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import type { appRouter } from '../../server/src/routers'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_error) => {
      // do something
    }
  })
})

export const link = new RPCLink({
  url: `${process.env.EXPO_PUBLIC_SERVER_URL}/rpc-v1`,
  headers() {
    const headers = new Map<string, string>()
    const cookies = authClient.getCookie()
    if (cookies) {
      headers.set('Cookie', cookies)
    }
    return Object.fromEntries(headers)
  }
})

export const client: RouterClient<typeof appRouter> = createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
