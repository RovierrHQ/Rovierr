import { ORPCError } from '@orpc/server'
import {
  organization,
  societyEmail as societyEmailTable,
  user
} from '@rov/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { protectedProcedure } from '@/lib/orpc'
import { validateVariables } from '@/lib/variable-replacement'
import {
  getOrganizationMemberCount,
  sendSocietyEmail as sendEmail
} from '@/services/email/society-email'

/**
 * Check if user is president of the organization
 */
async function isOrganizationPresident(
  headers: Headers,
  organizationId: string,
  userId: string
): Promise<boolean> {
  // Check if user has organization update permission (presidents have this)
  const result = await auth.api.hasPermission({
    headers,
    body: {
      permissions: {
        organization: ['update']
      },
      organizationId
    }
  })

  if (result?.success !== true) {
    return false
  }

  // Double-check user is actually a member with president/owner role
  const memberRecord = await db.query.member.findFirst({
    where: (memberTable) =>
      and(
        eq(memberTable.organizationId, organizationId),
        eq(memberTable.userId, userId)
      ),
    columns: {
      role: true
    }
  })

  return memberRecord?.role === 'owner' || memberRecord?.role === 'president'
}

export const societyEmail = {
  // ============================================================================
  // Send Email
  // ============================================================================
  send: protectedProcedure.societyEmail.send.handler(
    async ({ input, context }) => {
      const { organizationId, subject, bodyHtml, bodyText } = input
      const userId = context.session.user.id

      // Check authorization
      const isPresident = await isOrganizationPresident(
        context.headers,
        organizationId,
        userId
      )

      if (!isPresident) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Only society presidents can send emails'
        })
      }

      // Validate variables in subject and body
      const subjectVariables = validateVariables(subject)
      const bodyVariables = validateVariables(bodyHtml)
      const invalidVariables = [...subjectVariables, ...bodyVariables]

      if (invalidVariables.length > 0) {
        throw new ORPCError('VALIDATION_ERROR', {
          message: `Invalid variables: ${invalidVariables.join(', ')}`
        })
      }

      // Check if there are recipients
      const memberCount = await getOrganizationMemberCount(organizationId)
      if (memberCount === 0) {
        throw new ORPCError('NO_RECIPIENTS', {
          message: 'No active members to send email to'
        })
      }

      // Send email
      try {
        const result = await sendEmail({
          organizationId,
          senderId: userId,
          subject,
          bodyHtml,
          bodyText
        })

        return {
          emailId: result.emailId,
          recipientCount: result.recipientCount,
          status: result.status
        }
      } catch (error) {
        logger.error({ error, organizationId, userId }, 'Failed to send email')
        throw new ORPCError('SEND_FAILED', {
          message: 'Failed to send email'
        })
      }
    }
  ),

  // ============================================================================
  // Preview Email
  // ============================================================================
  preview: protectedProcedure.societyEmail.preview.handler(
    async ({ input, context }) => {
      const { organizationId, subject, bodyHtml } = input
      const userId = context.session.user.id

      // Check authorization
      const isPresident = await isOrganizationPresident(
        context.headers,
        organizationId,
        userId
      )

      if (!isPresident) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Only society presidents can preview emails'
        })
      }

      // Get organization name
      const org = await db.query.organization.findFirst({
        where: eq(organization.id, organizationId),
        columns: {
          name: true
        }
      })

      if (!org) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Organization not found'
        })
      }

      // Generate sample data
      const sampleData = {
        user: {
          name: 'John Doe',
          email: 'john.doe@university.edu',
          username: 'johndoe'
        },
        organization: {
          name: org.name
        }
      }

      // Replace variables with sample data
      const { replaceVariables } = await import('@/lib/variable-replacement')

      const previewSubject = replaceVariables(subject, sampleData, false)
      const previewHtml = replaceVariables(bodyHtml, sampleData, true)

      return {
        previewSubject,
        previewHtml,
        sampleData
      }
    }
  ),

  // ============================================================================
  // List Emails
  // ============================================================================
  list: protectedProcedure.societyEmail.list.handler(
    async ({ input, context }) => {
      const { organizationId, limit, offset } = input
      const userId = context.session.user.id

      // Check authorization
      const isPresident = await isOrganizationPresident(
        context.headers,
        organizationId,
        userId
      )

      if (!isPresident) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Only society presidents can view email history'
        })
      }

      // Get emails with sender info
      const emails = await db
        .select({
          id: societyEmailTable.id,
          subject: societyEmailTable.subject,
          recipientCount: societyEmailTable.recipientCount,
          successCount: societyEmailTable.successCount,
          failureCount: societyEmailTable.failureCount,
          status: societyEmailTable.status,
          sentAt: societyEmailTable.sentAt,
          sender: {
            id: user.id,
            name: user.name,
            image: user.image
          }
        })
        .from(societyEmailTable)
        .innerJoin(user, eq(societyEmailTable.senderId, user.id))
        .where(eq(societyEmailTable.organizationId, organizationId))
        .orderBy(desc(societyEmailTable.sentAt))
        .limit(limit)
        .offset(offset)

      // Get total count
      const totalResult = await db
        .select({ count: societyEmailTable.id })
        .from(societyEmailTable)
        .where(eq(societyEmailTable.organizationId, organizationId))

      const total = totalResult.length

      return {
        emails,
        total,
        hasMore: offset + limit < total
      }
    }
  ),

  // ============================================================================
  // Get Email Details
  // ============================================================================
  get: protectedProcedure.societyEmail.get.handler(
    async ({ input, context }) => {
      const { emailId } = input
      const userId = context.session.user.id

      // Get email with sender and organization info
      const email = await db.query.societyEmail.findFirst({
        where: eq(societyEmailTable.id, emailId),
        with: {
          sender: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          organization: {
            columns: {
              id: true,
              name: true
            }
          }
        }
      })

      if (!email) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Email not found'
        })
      }

      // Check authorization
      const isPresident = await isOrganizationPresident(
        context.headers,
        email.organizationId,
        userId
      )

      if (!isPresident) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Only society presidents can view email details'
        })
      }

      return email
    }
  )
}
