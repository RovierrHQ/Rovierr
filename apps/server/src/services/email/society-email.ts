import { db } from '@api/db'
import { env } from '@api/lib/env'
import { replaceVariables } from '@api/lib/variable-replacement'
import { member, organization, societyEmail, user } from '@rov/db/schema'
import { count, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { UseSend } from 'usesend-js'

const usesend = new UseSend(env.USESEND_API_KEY, 'https://usesend.rovierr.com')

// Simple logging functions
const logError = (message: string, data?: unknown) => {
  console.error(`[ERROR] ${message}`, data)
}

const logInfo = (message: string, data?: unknown) => {
  console.info(`[INFO] ${message}`, data)
}

type SendSocietyEmailParams = {
  organizationId: string
  senderId: string
  subject: string
  bodyHtml: string
  bodyText: string
}

type SendSocietyEmailResult = {
  emailId: string
  recipientCount: number
  status: 'completed' | 'failed'
}

/**
 * Send mass email to all society members
 *
 * @param params - Email parameters
 * @returns Result with email ID, recipient count, and status
 */
export async function sendSocietyEmail(
  params: SendSocietyEmailParams
): Promise<SendSocietyEmailResult> {
  const { organizationId, senderId, subject, bodyHtml, bodyText } = params

  try {
    // 1. Get organization details
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
      columns: {
        id: true,
        name: true
      }
    })

    if (!org) {
      throw new Error('Organization not found')
    }

    // 2. Get all active members with user details
    const members = await db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        username: user.username
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, organizationId))

    if (members.length === 0) {
      throw new Error('No active members to send email to')
    }

    // 3. Prepare batch emails with variable replacement
    const emails = members.map((memberData) => {
      const context = {
        user: {
          name: memberData.name,
          email: memberData.email,
          username: memberData.username
        },
        organization: {
          name: org.name
        }
      }

      return {
        from: 'Rovierr <noreply@clubs.rovierr.com>',
        to: memberData.email,
        subject: replaceVariables(subject, context, false), // Don't escape subject
        html: replaceVariables(bodyHtml, context, true), // Escape HTML content
        text: replaceVariables(bodyText, context, false) // Plain text doesn't need escaping
      }
    })

    // 4. Send via UseSend - send each email individually
    let successCount = 0
    let failureCount = 0

    // Send emails individually (UseSend will handle rate limiting)
    const sendPromises = emails.map(async (email) => {
      try {
        await usesend.emails.send(email)
        successCount++
      } catch (error) {
        logError('Failed to send email to recipient', {
          error,
          to: email.to,
          organizationId
        })
        failureCount++
      }
    })

    // Wait for all emails to be sent
    await Promise.allSettled(sendPromises)

    // 5. Store email record in database
    const emailId = nanoid()
    await db.insert(societyEmail).values({
      id: emailId,
      organizationId,
      senderId,
      subject,
      bodyHtml,
      bodyText,
      recipientCount: members.length,
      successCount,
      failureCount,
      status: failureCount > 0 ? 'failed' : 'completed',
      sentAt: new Date().toISOString()
    })

    logInfo('Society email sent', {
      emailId,
      organizationId,
      recipientCount: members.length,
      successCount,
      failureCount
    })

    return {
      emailId,
      recipientCount: members.length,
      status: failureCount > 0 ? 'failed' : 'completed'
    }
  } catch (error) {
    logError('Failed to send society email', {
      error,
      organizationId,
      senderId
    })

    // Store failed email record
    const emailId = nanoid()
    try {
      await db.insert(societyEmail).values({
        id: emailId,
        organizationId,
        senderId,
        subject,
        bodyHtml,
        bodyText,
        recipientCount: 0,
        successCount: 0,
        failureCount: 0,
        status: 'failed',
        sentAt: new Date().toISOString()
      })
    } catch (dbError) {
      logError('Failed to store failed email record', { dbError })
    }

    throw error
  }
}

export async function getOrganizationMemberCount(
  organizationId: string
): Promise<number> {
  try {
    const memberCount = await db
      .select({ count: count() })
      .from(member)
      .where(eq(member.organizationId, organizationId))
      .limit(1)

    return memberCount[0]?.count || 0
  } catch (error) {
    logError('Failed to get organization member count', {
      error,
      organizationId
    })
    return 0
  }
}
