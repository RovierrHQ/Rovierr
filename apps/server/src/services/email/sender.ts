import { UseSend } from 'usesend-js'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { generateOTPEmail } from './templates/otp'

const usesend = new UseSend(env.USESEND_API_KEY, 'https://usesend.rovierr.com')

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
