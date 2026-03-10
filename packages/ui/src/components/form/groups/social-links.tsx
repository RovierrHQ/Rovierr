'use client'

import { withFieldGroup } from '@rov/ui/components/form/index'

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
      handle = match[1] ?? ''
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
      handle = match[1] ?? ''
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
      handle = match[1] ?? ''
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
      handle = match[1] ?? ''
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
 * - https://wa.me/+1234567890 -> +1234567890
 */
export function extractWhatsAppNumber(url: string | null | undefined): string {
  if (!url) return ''
  let number = url.trim()
  // Extract from wa.me URL
  const waMeMatch = number.match(WA_ME_REGEX)
  if (waMeMatch) {
    number = waMeMatch[1] ?? ''
  }
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
      username = match[1] ?? ''
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

type SocialLinksFields = {
  website?: string
  whatsapp?: string
  telegram?: string
  instagram?: string
  facebook?: string
  twitter?: string
  linkedin?: string
}

// Default values for type mapping (not used at runtime)
const defaultValues: SocialLinksFields = {
  website: '',
  whatsapp: '',
  telegram: '',
  instagram: '',
  facebook: '',
  twitter: '',
  linkedin: ''
}

type SocialLinksGroupProps = {
  title?: string
  showWebsite?: boolean
  showWhatsApp?: boolean
  showTelegram?: boolean
  showInstagram?: boolean
  showFacebook?: boolean
  showTwitter?: boolean
  showLinkedIn?: boolean
}

export const SocialLinksFieldGroup = withFieldGroup<
  SocialLinksFields,
  unknown,
  SocialLinksGroupProps
>({
  defaultValues,
  props: {
    title: 'Social Links',
    showWebsite: true,
    showWhatsApp: true,
    showTelegram: true,
    showInstagram: true,
    showFacebook: true,
    showTwitter: true,
    showLinkedIn: true
  },
  render({
    group,
    title,
    showWebsite,
    showWhatsApp,
    showTelegram,
    showInstagram,
    showFacebook,
    showTwitter,
    showLinkedIn
  }) {
    return (
      <div className="space-y-4">
        {title && <h3 className="font-semibold text-base">{title}</h3>}

        {showWebsite && (
          <group.AppField name="website">
            {(field) => (
              <field.Text
                label="Website"
                onChange={(e) => {
                  field.handleChange(
                    e.target.value.startsWith('https://')
                      ? e.target.value
                      : `https://${e.target.value}`
                  )
                }}
                placeholder="https://yourwebsite.com"
                start="https://"
                value={field.state.value?.replace('https://', '') ?? ''}
              />
            )}
          </group.AppField>
        )}

        {showWhatsApp && (
          <group.AppField name="whatsapp">
            {(field) => (
              <field.Phone
                label="WhatsApp"
                onChange={(value) =>
                  field.handleChange(buildWhatsAppUrl(value))
                }
                placeholder="34567890"
                value={extractWhatsAppNumber(field.state.value) ?? ''}
              />
            )}
          </group.AppField>
        )}

        {showTelegram && (
          <group.AppField name="telegram">
            {(field) => (
              <field.Text
                label="Telegram"
                onChange={(e) =>
                  field.handleChange(buildTelegramUrl(e.target.value))
                }
                placeholder="username"
                start="t.me/"
                value={extractTelegramUsername(field.state.value) ?? ''}
              />
            )}
          </group.AppField>
        )}

        {showInstagram && (
          <group.AppField name="instagram">
            {(field) => (
              <field.Text
                label="Instagram"
                onChange={(e) =>
                  field.handleChange(buildInstagramUrl(e.target.value))
                }
                placeholder="username"
                start="instagram.com/"
                value={extractInstagramHandle(field.state.value) ?? ''}
              />
            )}
          </group.AppField>
        )}

        {showFacebook && (
          <group.AppField name="facebook">
            {(field) => (
              <field.Text
                label="Facebook"
                onChange={(e) =>
                  field.handleChange(buildFacebookUrl(e.target.value))
                }
                placeholder="https://facebook.com/..."
                start="facebook.com/"
                value={extractFacebookHandle(field.state.value) ?? ''}
              />
            )}
          </group.AppField>
        )}

        {showTwitter && (
          <group.AppField name="twitter">
            {(field) => (
              <field.Text
                label="Twitter/X"
                onChange={(e) =>
                  field.handleChange(buildTwitterUrl(e.target.value))
                }
                placeholder="https://twitter.com/..."
                start="twitter.com/"
                value={extractTwitterHandle(field.state.value) ?? ''}
              />
            )}
          </group.AppField>
        )}

        {showLinkedIn && (
          <group.AppField name="linkedin">
            {(field) => (
              <field.Text
                label="LinkedIn"
                onChange={(e) =>
                  field.handleChange(buildLinkedInUrl(e.target.value))
                }
                placeholder="https://linkedin.com/..."
                start="linkedin.com/in/"
                value={extractLinkedInHandle(field.state.value) ?? ''}
              />
            )}
          </group.AppField>
        )}
      </div>
    )
  }
})
