'use client'

import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a'
]

const ALLOWED_ATTR = ['href', 'target', 'rel']

/**
 * Sanitize HTML to prevent XSS attacks and ensure only allowed tags
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (will be sanitized on client)
    return html
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false
  })
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHtml(html: string): string {
  if (typeof document === 'undefined') {
    // Server-side: use regex fallback
    return html.replace(/<[^>]*>/g, '')
  }

  const temp = document.createElement('div')
  temp.innerHTML = html
  return temp.textContent || temp.innerText || ''
}

/**
 * Get the text length of HTML content (without tags)
 */
export function getTextLength(html: string): number {
  return stripHtml(html).length
}
