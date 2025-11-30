interface WelcomeEmailParams {
  userName: string
  societyName: string
  societyLink: string
}

interface RejectionEmailParams {
  userName: string
  societyName: string
  reason?: string
}

interface ConfirmationEmailParams {
  userName: string
  societyName: string
  requiresPayment: boolean
  paymentAmount?: string
  paymentInstructions?: string
  isAutoApproval: boolean
}

interface EmailContent {
  subject: string
  html: string
  text: string
}

/**
 * Helper to generate status message HTML
 */
function getStatusMessageHtml(params: ConfirmationEmailParams): string {
  if (params.isAutoApproval && !params.requiresPayment) {
    return `
            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-size: 16px; color: #065f46;">
                <strong>🎉 You're in!</strong><br>
                Your membership has been automatically approved. Welcome to ${params.societyName}!
              </p>
            </div>
            `
  }

  if (params.requiresPayment) {
    const paymentInstructionsHtml = params.paymentInstructions
      ? `
              <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px; color: #555;">
                  <strong>Payment Instructions:</strong><br>
                  ${params.paymentInstructions}
                </p>
              </div>
              `
      : ''

    return `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-size: 16px; color: #92400e;">
                <strong>💳 Payment Required</strong><br>
                To complete your membership, please submit payment of <strong>${params.paymentAmount}</strong>.
              </p>
              ${paymentInstructionsHtml}
            </div>
            `
  }

  return `
            <p style="font-size: 16px; color: #555;">
              Your application is currently under review. The society leadership will review your application and get back to you soon.
            </p>
            `
}

/**
 * Helper to generate status message text
 */
function getStatusMessageText(params: ConfirmationEmailParams): string {
  if (params.isAutoApproval && !params.requiresPayment) {
    return `🎉 You're in! Your membership has been automatically approved. Welcome to ${params.societyName}!`
  }

  if (params.requiresPayment) {
    const instructions = params.paymentInstructions
      ? `Payment Instructions:\n${params.paymentInstructions}`
      : ''
    return `💳 Payment Required\n\nTo complete your membership, please submit payment of ${params.paymentAmount}.\n\n${instructions}`
  }

  return 'Your application is currently under review. The society leadership will review your application and get back to you soon.'
}

/**
 * Generate welcome email for approved members
 */
export function generateWelcomeEmail(params: WelcomeEmailParams): EmailContent {
  return {
    subject: `Welcome to ${params.societyName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${params.societyName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome!</h1>
          </div>

          <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${params.userName},</h2>

            <p style="font-size: 16px; color: #555;">
              Great news! Your application to join <strong>${params.societyName}</strong> has been approved. You are now officially a member!
            </p>

            <p style="font-size: 16px; color: #555;">
              You can now access all member-only features, participate in events, and connect with other members.
            </p>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${params.societyLink}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Visit Society Page
              </a>
            </div>

            <p style="font-size: 14px; color: #888;">
              We're excited to have you as part of our community. If you have any questions, feel free to reach out to the society leadership.
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated message from Rovierr.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Rovierr. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to ${params.societyName}!

Hi ${params.userName},

Great news! Your application to join ${params.societyName} has been approved. You are now officially a member!

You can now access all member-only features, participate in events, and connect with other members.

Visit your society page: ${params.societyLink}

We're excited to have you as part of our community. If you have any questions, feel free to reach out to the society leadership.

© ${new Date().getFullYear()} Rovierr. All rights reserved.`
  }
}

/**
 * Generate rejection notification email
 */
export function generateRejectionEmail(
  params: RejectionEmailParams
): EmailContent {
  return {
    subject: `Update on your ${params.societyName} application`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Update</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Application Update</h1>
          </div>

          <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${params.userName},</h2>

            <p style="font-size: 16px; color: #555;">
              Thank you for your interest in joining <strong>${params.societyName}</strong>.
            </p>

            <p style="font-size: 16px; color: #555;">
              After careful review, we regret to inform you that we are unable to approve your application at this time.
            </p>

            ${
              params.reason
                ? `
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #555;">
                <strong>Reason:</strong><br>
                ${params.reason}
              </p>
            </div>
            `
                : ''
            }

            <p style="font-size: 14px; color: #888;">
              We appreciate your understanding. If you have any questions or would like more information, please feel free to contact the society leadership.
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated message from Rovierr.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Rovierr. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `Application Update

Hi ${params.userName},

Thank you for your interest in joining ${params.societyName}.

After careful review, we regret to inform you that we are unable to approve your application at this time.

${params.reason ? `Reason: ${params.reason}` : ''}

We appreciate your understanding. If you have any questions or would like more information, please feel free to contact the society leadership.

© ${new Date().getFullYear()} Rovierr. All rights reserved.`
  }
}

/**
 * Generate confirmation email after submission
 */
export function generateConfirmationEmail(
  params: ConfirmationEmailParams
): EmailContent {
  return {
    subject: `Application received for ${params.societyName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Received</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✓ Application Received</h1>
          </div>

          <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${params.userName},</h2>

            <p style="font-size: 16px; color: #555;">
              Thank you for applying to join <strong>${params.societyName}</strong>! We've received your application.
            </p>

            ${getStatusMessageHtml(params)}

            <p style="font-size: 14px; color: #888;">
              You can check the status of your application anytime from your Rovierr profile.
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated message from Rovierr.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Rovierr. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `Application Received

Hi ${params.userName},

Thank you for applying to join ${params.societyName}! We've received your application.

${getStatusMessageText(params)}

You can check the status of your application anytime from your Rovierr profile.

© ${new Date().getFullYear()} Rovierr. All rights reserved.`
  }
}
