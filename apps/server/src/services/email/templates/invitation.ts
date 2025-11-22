interface InvitationEmailParams {
  organizationName: string
  inviterName: string
  role: string
  signupLink: string
  societiesLink: string
  expiresAt: Date
}

interface EmailContent {
  subject: string
  html: string
  text: string
}

/**
 * Generate organization invitation email content
 * @param params - Email parameters including organization name, inviter, role, and invitation link
 * @returns Email subject, HTML body, and plain text body
 */
export function generateInvitationEmail(
  params: InvitationEmailParams
): EmailContent {
  const expiresDate = params.expiresAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const expiresTime = params.expiresAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  return {
    subject: `You've been invited to join ${params.organizationName} on Rovierr`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Organization Invitation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
          </div>

          <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi there,</h2>

            <p style="font-size: 16px; color: #555;">
              <strong>${params.inviterName}</strong> has invited you to join <strong>${params.organizationName}</strong> on Rovierr as a <strong>${params.role}</strong>.
            </p>

            <div style="text-align: center; margin: 40px 0;">
              <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                If you already have a Rovierr account, you can accept this invitation by going to your societies page.
              </p>
              <a href="${params.societiesLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-right: 12px;">
                Go to My Societies
              </a>
              <p style="font-size: 14px; color: #888; margin-top: 20px;">
                If you haven't signed up yet, create your account first:
              </p>
              <a href="${params.signupLink}" style="background: #ffffff; color: #667eea; border: 2px solid #667eea; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Sign Up to Rovierr
              </a>
            </div>

            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              ⏱️ This invitation expires on <strong>${expiresDate}</strong> at <strong>${expiresTime}</strong>.
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Rovierr. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `You're Invited!

Hi there,

${params.inviterName} has invited you to join ${params.organizationName} on Rovierr as a ${params.role}.

If you already have a Rovierr account, go to your societies page to accept this invitation:
${params.societiesLink}

If you haven't signed up yet, create your account first:
${params.signupLink}

This invitation expires on ${expiresDate} at ${expiresTime}.

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} Rovierr. All rights reserved.`
  }
}
