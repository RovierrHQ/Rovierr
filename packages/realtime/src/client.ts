import { Centrifuge } from 'centrifuge'
import { useEffect, useRef } from 'react'

/**
 * React hook for subscribing to Centrifugo channels
 */
export function useCentrifugo<T = unknown>(
  config: {
    url: string
    token?: string
  },
  channel: string,
  onMessage: (data: T) => void
) {
  const centrifugeRef = useRef<Centrifuge | null>(null)

  useEffect(() => {
    if (!(config.url && channel)) return

    // Create Centrifuge instance
    const centrifuge = new Centrifuge(config.url, {
      token: config.token
    })

    centrifugeRef.current = centrifuge

    // Subscribe to channel
    const subscription = centrifuge.newSubscription(channel)

    subscription.on('publication', (ctx) => {
      onMessage(ctx.data as T)
    })

    subscription.subscribe()
    centrifuge.connect()

    // Cleanup
    return () => {
      subscription.unsubscribe()
      centrifuge.disconnect()
      centrifugeRef.current = null
    }
  }, [config.url, config.token, channel, onMessage])

  return centrifugeRef
}

/**
 * Create Centrifuge client instance
 */
export function createCentrifugeClient(config: {
  url: string
  token?: string
}) {
  return new Centrifuge(config.url, {
    token: config.token
  })
}
