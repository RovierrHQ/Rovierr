import { institution as institutionTable } from '@rov/db'
import { CryptoHasher } from 'bun'
import { eq } from 'drizzle-orm'
import { db } from '@/db'

/**
 * Generate a random 6-digit OTP code
 * @returns A string containing 6 digits (000000-999999)
 */
export function generateOTP(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString()
}

/**
 * Hash an OTP code using SHA-256
 * @param otp - The plain text OTP to hash
 * @returns The hashed OTP as a hex string
 */
export function hashOTP(otp: string): string {
  return new CryptoHasher('sha256').update(otp).digest('hex')
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
