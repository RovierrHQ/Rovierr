import { institution as institutionTable } from '@rov/db'
import { eq } from 'drizzle-orm'
import { db } from './db'

/**
 * Generate a random 6-digit OTP code
 * @returns A string containing 6 digits (000000-999999)
 */
export function generateOTP(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString()
}

/**
 * Hash an OTP code using SHA-256 (Web Crypto, works on Workers)
 * @param otp - The plain text OTP to hash
 * @returns The hashed OTP as a hex string
 */
export async function hashOTP(otp: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(otp)
  )
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Validate that an email domain matches one of the institution's valid domains
 * @param email - The email address to validate
 * @param institutionId - The ID of the institution to check against
 * @returns True if the email domain is valid for the institution
 */
export async function validateUniversityEmail(
  email: string,
  institutionId: string
): Promise<boolean> {
  const institution = await db.query.institution.findFirst({
    where: eq(institutionTable.id, institutionId)
  })

  if (!institution) return false

  return institution.validEmailDomains.some((domain) =>
    email.toLowerCase().endsWith(domain.toLowerCase())
  )
}
