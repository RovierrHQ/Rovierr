import { UseSend } from 'usesend-js'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { generateInvitationEmail } from './templates/invitation'
import { generateOTPEmail } from './templates/otp'

const usesend = new UseSend(env.USESEND_API_KEY, 'https://usesend.rovierr.com')

interface SendOTPEmailParams {
  to: string
  displayName: string
  otp: string
}

/**
 * Send OTP verification email using UseSend
 * @param params - Email parameters including recipient, display name, and OTP
 * @throws Error if email delivery fails
 */
export async function sendOTPEmail(params: SendOTPEmailParams) {
  const { subject, html, text } = generateOTPEmail({
    displayName: params.displayName,
    otp: params.otp,
    expiresIn: '10 minutes'
  })

  try {
    await usesend.emails.send({
      from: 'Rovierr <noreply@clubs.rovierr.com>',
      to: params.to,
      subject,
      html,
      text
    })
  } catch (error) {
    logger.error({ error, to: params.to }, 'Failed to send OTP email')
    throw new Error('Email delivery failed')
  }
}

/**
 * Send email verification OTP
 * Used by Better Auth for sign-in, email verification, and password reset
 */
export async function sendEmailVerificationOTP({
  email,
  otp,
  type
}: {
  email: string
  otp: string
  type: 'sign-in' | 'email-verification' | 'forget-password'
}) {
  // Extract display name from email (part before @)
  const displayName = email.split('@')[0] ?? 'User'

  const { subject, html, text } = generateOTPEmail({
    displayName,
    otp,
    expiresIn: '10 minutes'
  })

  try {
    await usesend.emails.send({
      from: 'Rovierr <noreply@clubs.rovierr.com>',
      to: email,
      subject,
      html,
      text
    })
  } catch (error) {
    logger.error(
      { error, to: email, type },
      'Failed to send email verification OTP'
    )
    throw new Error('Email delivery failed')
  }
}

/**
 * Send phone number verification OTP
 * Used by Better Auth for phone number verification
 *
 * Note: Better Auth phone plugin typically handles SMS sending separately.
 * This function is required by the interface but may not be called if SMS
 * is configured directly in the phone plugin configuration.
 */
export function sendPhoneNumberVerificationOTP({
  phoneNumber: _phoneNumber,
  code: _code
}: {
  phoneNumber: string
  code: string
}): Promise<void> {
  // For phone numbers, SMS is typically handled by the phone plugin directly
  // This function exists to satisfy the AuthConfig interface
  // In production, integrate with an SMS service like Twilio if needed
  logger.info(
    { phoneNumber: _phoneNumber },
    'Phone verification code requested'
  )

  // Return a rejected promise to indicate this method is not implemented
  return Promise.reject(
    new Error(
      'Phone number verification via email is not supported. Please configure SMS in the phone plugin.'
    )
  )
}

/**
 * Send organization invitation email
 * Used by Better Auth organization plugin
 */
export async function sendInvitationEmail({
  role,
  email,
  organization,
  invitation,
  inviter
}: {
  id: string
  role: string
  email: string
  organization: { id?: string; name: string; [key: string]: unknown }
  invitation: { expiresAt: Date; [key: string]: unknown }
  inviter: { user: { name?: string | null; email?: string | null } }
}) {
  const inviterName =
    inviter.user.name ?? inviter.user.email?.split('@')[0] ?? 'Someone'
  const organizationName = organization.name ?? 'an organization'

  // Construct links for existing users and new signups
  const societiesLink = `${env.WEB_URL}/spaces/societies/mine`
  const signupLink = `${env.WEB_URL}/signup`

  const { subject, html, text } = generateInvitationEmail({
    organizationName,
    inviterName,
    role,
    signupLink,
    societiesLink,
    expiresAt: invitation.expiresAt
  })

  try {
    await usesend.emails.send({
      from: 'Rovierr <noreply@clubs.rovierr.com>',
      to: email,
      subject,
      html,
      text
    })
  } catch (error) {
    logger.error(
      { error, to: email, organizationId: organization.id },
      'Failed to send invitation email'
    )
    throw new Error('Email delivery failed')
  }
}
