import { PostHog } from 'posthog-node'
import { env } from './env'

const posthog = new PostHog(env.POSTHOG_API_KEY, {
  host: env.POSTHOG_HOST
})

type EventType = 'user.created' | 'user.onboarding_submitted' | 'user.verified'

/**
 * Emit an event to PostHog for analytics tracking
 * @param type - The type of event to emit
 * @param userId - The user ID associated with the event
 * @param properties - Additional properties to include with the event
 */
export function emitEvent(
  type: EventType,
  userId: string,
  properties: Record<string, unknown>
) {
  posthog.capture({
    distinctId: userId,
    event: type,
    properties
  })
}

/**
 * Shutdown PostHog client gracefully
 * Call this when the server is shutting down
 */
export async function shutdownEvents(): Promise<void> {
  await posthog.shutdown()
}
