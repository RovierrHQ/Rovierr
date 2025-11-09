import { CryptoHasher } from 'bun'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { university as universityTable } from '@/db/schema/university'

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
 * Validate that an email domain matches one of the university's valid domains
 * @param email - The email address to validate
 * @param universityId - The ID of the university to check against
 * @param db - The database instance
 * @returns True if the email domain is valid for the university
 */
export async function validateUniversityEmail(
  email: string,
  universityId: string
): Promise<boolean> {
  const university = await db.query.university.findFirst({
    where: eq(universityTable.id, universityId)
  })

  if (!university) return false

  return university.validEmailDomains.some((domain) =>
    email.toLowerCase().endsWith(domain.toLowerCase())
  )
}
