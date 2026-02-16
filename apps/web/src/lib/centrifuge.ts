import { useEffect, useRef } from 'react'
import { Centrifuge } from 'centrifuge'

type UseCentrifugoOptions = {
  token?: string
}

type UseCentrifugoProps<T = unknown> = UseCentrifugoOptions & {
  channel: string
  onMessage?: (data: T) => void
}

export function useCentrifugo<T = unknown>(
  options: UseCentrifugoProps<T>
) {
  const { token, channel, onMessage } = options
  const centrifugeRef = useRef<Centrifuge | null>(null)

  useEffect(() => {
    if (!token || !channel) {
      return
    }

    // Create Centrifuge instance
    const centrifuge = new Centrifuge('ws://localhost:3001/connection/websocket', {
      token
    })

    centrifugeRef.current = centrifuge

    // Subscribe to channel
    const subscription = centrifuge.subscribe(channel, (message) => {
      if (onMessage && message.data) {
        onMessage(message.data)
      }
    })

    // Connect
    centrifuge.connect()

    // Cleanup
    return () => {
      subscription.unsubscribe()
      centrifuge.disconnect()
    }
  }, [token, channel, onMessage])

  return centrifugeRef.current
}
