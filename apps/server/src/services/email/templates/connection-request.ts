/**
 * Connection Request Email Template
 */

interface ConnectionRequestEmailParams {
  recipientName: string
  senderName: string
  senderUsername?: string
  profileLink: string
}

export function generateConnectionRequestEmail(
  params: ConnectionRequestEmailParams
) {
  const { recipientName, senderName, senderUsername, profileLink } = params

  const subject = `${senderName} wants to connect with you on Rovierr`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connection Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                New Connection Request
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #4a4a4a;">
                Hi ${recipientName},
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #4a4a4a;">
                <strong>${senderName}</strong>${senderUsername ? ` (@${senderUsername})` : ''} wants to connect with you on Rovierr.
              </p>

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.5; color: #4a4a4a;">
                View their profile and respond to their connection request.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="${profileLink}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                      View Connection Request
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                You can accept or decline this request from your People page.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">
                This email was sent by Rovierr. If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
Hi ${recipientName},

${senderName}${senderUsername ? ` (@${senderUsername})` : ''} wants to connect with you on Rovierr.

View their profile and respond to their connection request:
${profileLink}

You can accept or decline this request from your People page.

---
This email was sent by Rovierr. If you didn't expect this email, you can safely ignore it.
  `.trim()

  return { subject, html, text }
}
