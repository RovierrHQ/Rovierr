interface OTPEmailParams {
  displayName: string
  otp: string
  expiresIn: string
}

interface EmailContent {
  subject: string
  html: string
  text: string
}

/**
 * Generate OTP verification email content
 * @param params - Email parameters including display name, OTP, and expiration time
 * @returns Email subject, HTML body, and plain text body
 */
export function generateOTPEmail(params: OTPEmailParams): EmailContent {
  return {
    subject: 'Your Rovierr verification code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Rovierr!</h1>
          </div>

          <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${params.displayName},</h2>

            <p style="font-size: 16px; color: #555;">Your verification code is:</p>

            <div style="background: #f7f7f7; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                ${params.otp}
              </div>
            </div>

            <p style="font-size: 16px; color: #555;">Enter this code to verify your university email and access student features.</p>

            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              ⏱️ This code expires in <strong>${params.expiresIn}</strong>.
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Rovierr. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to Rovierr, ${params.displayName}!

Your verification code is: ${params.otp}

Enter this code to verify your university email and access student features.

This code expires in ${params.expiresIn}.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} Rovierr. All rights reserved.`
  }
}
