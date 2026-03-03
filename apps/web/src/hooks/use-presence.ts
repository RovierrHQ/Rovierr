import { useCentrifugo } from '@rov/realtime/client'
import { authClient } from '@web/lib/auth-client'

export function usePresence() {
  const { data: session } = authClient.useSession()

  // Subscribe to presence updates for the current user
  useCentrifugo(
    {
      url: import.meta.env.VITE_CENTRIFUGO_URL
    },
    `presence:${session?.user?.id}`,
    (data) => {
      // Handle presence updates
      console.log('Presence update:', data)
    }
  )
}
