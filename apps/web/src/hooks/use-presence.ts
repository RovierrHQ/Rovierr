import { useCentrifugo } from '@web/lib/centrifuge'
import { authClient } from '@web/lib/auth-client'

export function usePresence() {
  const { data: session } = authClient.useSession()

  // Subscribe to presence updates for the current user
  useCentrifugo(
    {
      // Token will be handled by the centrifuge hook
    },
    `presence:${session?.user?.id}`,
    (data) => {
      // Handle presence updates
      console.log('Presence update:', data)
    }
  )
}
