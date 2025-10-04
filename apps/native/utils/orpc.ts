import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import {
  type ContractRouterClient,
  inferRPCMethodFromContractRouter
} from '@orpc/contract'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { appContract } from '@rov/orpc-contracts'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_error) => {
      // do something
    }
  })
})

export const link = new RPCLink({
  url: `${process.env.EXPO_PUBLIC_SERVER_URL}/rpc-v1`,
  method: inferRPCMethodFromContractRouter(appContract),
  headers() {
    const headers = new Map<string, string>()
    const cookies = authClient.getCookie()
    if (cookies) {
      headers.set('Cookie', cookies)
    }
    return Object.fromEntries(headers)
  }
})

export const client: ContractRouterClient<typeof appContract> =
  createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
