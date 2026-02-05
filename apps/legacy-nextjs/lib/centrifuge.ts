/** biome-ignore-all lint/suspicious/noConsole: debug */
import { Centrifuge } from 'centrifuge'
import { useEffect, useRef } from 'react'

/**
 * Get Centrifugo URL from environment variables
 * Logs error if not configured
 */
function getCentrifugoUrl(): string {
  const url = process.env.NEXT_PUBLIC_CENTRIFUGO_URL

  if (!url) {
    console.error(
      'NEXT_PUBLIC_CENTRIFUGO_URL is not set. Please configure it in your .env file.'
    )
    return ''
  }

  return url
}

/**
 * React hook for subscribing to Centrifugo channels
 */
export function useCentrifugo<T = unknown>(
  config: {
    url?: string
    token?: string
  },
  channel: string,
  onMessage: (data: T) => void
) {
  const centrifugeRef = useRef<Centrifuge | null>(null)
  const onMessageRef = useRef(onMessage)

  // Keep the callback ref up to date
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const centrifugoUrl = config.url || getCentrifugoUrl()

    // Don't connect if URL or token is not available
    if (!centrifugoUrl) {
      console.warn('Centrifugo URL is not configured. Skipping connection.')
      return
    }

    if (!config.token) {
      console.warn('Centrifugo token is not available. Skipping connection.')
      return
    }

    if (!channel) {
      console.warn('Centrifugo channel is not specified. Skipping connection.')
      return
    }

    // Create Centrifuge instance
    const centrifuge = new Centrifuge(centrifugoUrl, {
      token: config.token
    })

    centrifugeRef.current = centrifuge

    // Subscribe to channel
    const subscription = centrifuge.newSubscription(channel)

    subscription.on('publication', (ctx) => {
      // Use the ref to get the latest callback
      onMessageRef.current(ctx.data as T)
    })

    subscription.subscribe()
    centrifuge.connect()

    // Cleanup
    return () => {
      subscription.unsubscribe()
      centrifuge.disconnect()
      centrifugeRef.current = null
    }
  }, [config.url, config.token, channel])

  return centrifugeRef
}

/**
 * Create Centrifuge client instance
 */
export function createCentrifugeClient(config: {
  url?: string
  token?: string
}) {
  const centrifugoUrl = config.url || getCentrifugoUrl()

  if (!centrifugoUrl) {
    throw new Error(
      'NEXT_PUBLIC_CENTRIFUGO_URL is not set. Please configure it in your .env file.'
    )
  }

  return new Centrifuge(centrifugoUrl, {
    token: config.token
  })
}
