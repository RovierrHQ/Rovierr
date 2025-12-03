/**
 * Hook for subscribing to user presence updates
 */
'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { useCentrifugo } from '@/lib/centrifuge'
import { orpc } from '@/utils/orpc'

export function usePresence() {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  // Get Centrifugo connection token
  const { data: centrifugoAuth } = useQuery(
    orpc.realtime.getConnectionToken.queryOptions({
      enabled: !!session?.user?.id,
      staleTime: 55 * 60 * 1000 // 55 minutes (token expires in 1 hour)
    })
  )

  // Subscribe to presence updates
  useCentrifugo<{
    type: string
    userId: string
    status: 'online' | 'away' | 'offline'
    lastSeenAt: string
  }>(
    {
      token: centrifugoAuth?.token
    },
    `chat:${session?.user?.id}`,
    (data) => {
      if (data.type === 'presence') {
        // Update presence cache
        queryClient.setQueryData(['presence', data.userId], {
          status: data.status,
          lastSeenAt: data.lastSeenAt
        })
      }
    }
  )
}
