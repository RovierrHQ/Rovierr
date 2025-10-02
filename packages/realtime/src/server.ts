/**
 * Centrifugo Server Client (for backend)
 * Used to publish messages to channels from your server
 */
export function createCentrifugeServerClient(config: {
  url: string
  apiKey: string
}) {
  return {
    async publish(channel: string, data: unknown) {
      const response = await fetch(`${config.url}/api/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `apikey ${config.apiKey}`
        },
        body: JSON.stringify({
          channel,
          data
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to publish to channel ${channel}`)
      }

      return response.json()
    }
  }
}

/**
 * Generate Centrifugo connection token for a user
 *
 * @param userId - The user ID to generate token for
 * @param secret - HMAC secret key from Centrifugo config (CENTRIFUGO_HMAC_SECRET_KEY)
 * @param expiresIn - Token expiration time (default: '1h'). Examples: '1h', '30m', '7d'
 * @returns Signed JWT token for WebSocket authentication using HMAC-SHA256
 *
 * @remarks
 * This function generates a properly signed JWT token for Centrifugo WebSocket authentication.
 * Uses `jose` library which leverages the Web Crypto API for modern, secure JWT operations.
 *
 * Security benefits:
 * - Verifies user identity on WebSocket connection
 * - Prevents unauthorized access to channels
 * - Ensures users can only subscribe to their authorized channels
 * - Protects against token tampering (HMAC signature)
 * - Works in all environments (Node.js, edge runtimes, browsers)
 *
 * The token is signed with HS256 (HMAC-SHA256) algorithm and includes:
 * - `sub` claim: user ID (required by Centrifugo)
 * - `exp` claim: expiration timestamp (prevents token reuse)
 *
 * @example
 * ```typescript
 * // Backend: Generate token for authenticated user
 * const token = await generateConnectionToken(
 *   user.id,
 *   process.env.CENTRIFUGO_HMAC_SECRET_KEY!,
 *   '1h'
 * )
 *
 * // Send to client
 * return { connectionToken: token }
 *
 * // Frontend: Use token for WebSocket connection
 * useCentrifugo(
 *   { url: CENTRIFUGO_URL, token },
 *   `calendar:${userId}`,
 *   handleMessage
 * )
 * ```
 *
 * @see https://centrifugal.dev/docs/server/authentication
 * @see https://github.com/panva/jose - Modern JWT library using Web Crypto API
 */
export async function generateConnectionToken(
  userId: string,
  secret: string,
  expiresIn = '1h'
): Promise<string> {
  const { SignJWT } = await import('jose')

  // Convert secret string to Uint8Array for jose
  const secretKey = new TextEncoder().encode(secret)

  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey)
}
