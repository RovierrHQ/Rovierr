import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import {
  type ContractRouterClient,
  inferRPCMethodFromContractRouter
} from '@orpc/contract'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { appContract } from '@rov/orpc-contracts'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: 'retry',
          onClick: () => {
            queryClient.invalidateQueries()
          }
        }
      })
    }
  })
})

export const link = new RPCLink({
  url: `${process.env.NEXT_PUBLIC_SERVER_URL}/rpc-v1`,
  method: inferRPCMethodFromContractRouter(appContract),
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: 'include'
    })
  }
})

export const client: ContractRouterClient<typeof appContract> =
  createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
