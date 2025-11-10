import { Resend } from 'resend'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { generateOTPEmail } from './templates/otp'

const resend = new Resend(env.USESEND_API_KEY)

interface SendOTPEmailParams {
  to: string
  displayName: string
  otp: string
}

/**
 * Send OTP verification email using Resend
 * @param params - Email parameters including recipient, display name, and OTP
 * @throws Error if email delivery fails
 */
export async function sendOTPEmail(params: SendOTPEmailParams): Promise<void> {
  const { subject, html, text } = generateOTPEmail({
    displayName: params.displayName,
    otp: params.otp,
    expiresIn: '10 minutes'
  })

  try {
    await resend.emails.send({
      from: 'Rovierr <noreply@rovierr.com>',
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
