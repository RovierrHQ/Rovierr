// Helper functions to extract handles/phone numbers from URLs and construct URLs

// Regex patterns defined at top level for performance
const AT_PREFIX_REGEX = /^@/
const TRAILING_SLASH_REGEX = /\/$/
const INSTAGRAM_COM_REGEX = /instagram\.com\/([^/?]+)/i
const INSTAGRAM_AM_REGEX = /instagr\.am\/([^/?]+)/i
const FACEBOOK_COM_REGEX = /facebook\.com\/([^/?]+)/i
const FB_COM_REGEX = /fb\.com\/([^/?]+)/i
const TWITTER_X_COM_REGEX = /(?:twitter|x)\.com\/([^/?]+)/i
const LINKEDIN_COM_IN_REGEX = /linkedin\.com\/in\/([^/?]+)/i
const LINKEDIN_COM_REGEX = /linkedin\.com\/([^/?]+)/i
const WA_ME_REGEX = /wa\.me\/([^/?]+)/i
const NON_DIGIT_REGEX = /\D/g
const TELEGRAM_ME_REGEX = /t\.me\/([^/?]+)/i
const TELEGRAM_ME_FULL_REGEX = /telegram\.me\/([^/?]+)/i

/**
 * Extract Instagram handle from URL
 * Examples:
 * - https://instagram.com/username -> username
 * - https://www.instagram.com/username/ -> username
 * - @username -> username
 * - username -> username
 */
export function extractInstagramHandle(url: string | null | undefined): string {
  if (!url) return ''
  // Remove @ if present
  let handle = url.replace(AT_PREFIX_REGEX, '')
  // Extract from URL patterns
  const patterns = [INSTAGRAM_COM_REGEX, INSTAGRAM_AM_REGEX]
  for (const pattern of patterns) {
    const match = handle.match(pattern)
    if (match) {
      handle = match[1]
      break
    }
  }
  // Remove trailing slash
  return handle.replace(TRAILING_SLASH_REGEX, '').trim()
}

/**
 * Construct Instagram URL from handle
 */
export function buildInstagramUrl(handle: string): string {
  if (!handle) return ''
  const cleanHandle = extractInstagramHandle(handle)
  return `https://www.instagram.com/${cleanHandle}/`
}

/**
 * Extract Facebook handle from URL
 */
export function extractFacebookHandle(url: string | null | undefined): string {
  if (!url) return ''
  let handle = url.replace(AT_PREFIX_REGEX, '')
  const patterns = [FACEBOOK_COM_REGEX, FB_COM_REGEX]
  for (const pattern of patterns) {
    const match = handle.match(pattern)
    if (match) {
      handle = match[1]
      break
    }
  }
  return handle.replace(TRAILING_SLASH_REGEX, '').trim()
}

/**
 * Construct Facebook URL from handle
 */
export function buildFacebookUrl(handle: string): string {
  if (!handle) return ''
  const cleanHandle = extractFacebookHandle(handle)
  return `https://www.facebook.com/${cleanHandle}/`
}

/**
 * Extract Twitter/X handle from URL
 */
export function extractTwitterHandle(url: string | null | undefined): string {
  if (!url) return ''
  let handle = url.replace(AT_PREFIX_REGEX, '')
  const patterns = [TWITTER_X_COM_REGEX]
  for (const pattern of patterns) {
    const match = handle.match(pattern)
    if (match) {
      handle = match[1]
      break
    }
  }
  return handle.replace(TRAILING_SLASH_REGEX, '').trim()
}

/**
 * Construct Twitter/X URL from handle
 */
export function buildTwitterUrl(handle: string): string {
  if (!handle) return ''
  const cleanHandle = extractTwitterHandle(handle)
  return `https://twitter.com/${cleanHandle}`
}

/**
 * Extract LinkedIn handle from URL
 */
export function extractLinkedInHandle(url: string | null | undefined): string {
  if (!url) return ''
  let handle = url.replace(AT_PREFIX_REGEX, '')
  const patterns = [LINKEDIN_COM_IN_REGEX, LINKEDIN_COM_REGEX]
  for (const pattern of patterns) {
    const match = handle.match(pattern)
    if (match) {
      handle = match[1]
      break
    }
  }
  return handle.replace(TRAILING_SLASH_REGEX, '').trim()
}

/**
 * Construct LinkedIn URL from handle
 */
export function buildLinkedInUrl(handle: string): string {
  if (!handle) return ''
  const cleanHandle = extractLinkedInHandle(handle)
  return `https://www.linkedin.com/in/${cleanHandle}/`
}

/**
 * Extract WhatsApp phone number from URL
 * Examples:
 * - https://wa.me/1234567890 -> 1234567890
 * - +1234567890 -> 1234567890
 * - 1234567890 -> 1234567890
 */
export function extractWhatsAppNumber(url: string | null | undefined): string {
  if (!url) return ''
  let number = url.trim()
  // Extract from wa.me URL
  const waMeMatch = number.match(WA_ME_REGEX)
  if (waMeMatch) {
    number = waMeMatch[1]
  }
  // Remove + if present (we'll add it via prefix in UI)
  if (number.startsWith('+')) {
    number = number.slice(1)
  }
  // Remove any non-digit characters
  number = number.replace(NON_DIGIT_REGEX, '')
  return number
}

/**
 * Construct WhatsApp URL from phone number
 */
export function buildWhatsAppUrl(number: string): string {
  if (!number) return ''
  // Extract and clean the number (removes + and non-digits)
  const cleanNumber = extractWhatsAppNumber(number)
  if (!cleanNumber) return ''
  return `https://wa.me/${cleanNumber}`
}

/**
 * Extract Telegram username from URL
 * Examples:
 * - https://t.me/username -> username
 * - @username -> username
 * - username -> username
 */
export function extractTelegramUsername(
  url: string | null | undefined
): string {
  if (!url) return ''
  let username = url.trim()
  // Remove @ if present (we'll add it via prefix in UI)
  if (username.startsWith('@')) {
    username = username.slice(1)
  }
  const patterns = [TELEGRAM_ME_REGEX, TELEGRAM_ME_FULL_REGEX]
  for (const pattern of patterns) {
    const match = username.match(pattern)
    if (match) {
      username = match[1]
      break
    }
  }
  return username.replace(TRAILING_SLASH_REGEX, '').trim()
}

/**
 * Construct Telegram URL from username
 */
export function buildTelegramUrl(username: string): string {
  if (!username) return ''
  const cleanUsername = extractTelegramUsername(username)
  if (!cleanUsername) return ''
  return `https://t.me/${cleanUsername}`
}
