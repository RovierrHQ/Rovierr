import { auth } from '@api/lib/auth'
import { db } from '@api/lib/db'
import {
  replaceVariables,
  validateVariables
} from '@api/lib/variable-replacement'
import { betterAuth } from '@api/middleware/auth'
import {
  organization,
  societyEmail as societyEmailTable,
  user as userTable
} from '@rov/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import {
  listEmailsSchema,
  previewEmailSchema,
  sendEmailSchema
} from './schemas'
import {
  getOrganizationMemberCount,
  sendSocietyEmail as sendEmail
} from './service/society-email'

/**
 * Check if user is president of the organization
 */
async function isOrganizationPresident(
  headers: Record<string, string | undefined>,
  organizationId: string,
  userId: string
): Promise<boolean> {
  // Convert headers record to Headers object
  const headersObj = new Headers()
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      headersObj.set(key, value)
    }
  }

  // Check if user has organization update permission (presidents have this)
  const result = await auth.api.hasPermission({
    headers: headersObj,
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

export const societyEmailRouter = new Elysia({ name: '/email' })
  .use(betterAuth)
  .group('/email', { auth: true }, (app) =>
    app
      /**
       * Send mass email to all society members
       * POST /email/send
       */
      .post(
        '/send',
        async ({ body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const { organizationId, subject, bodyHtml, bodyText } = body
          const userId = user.id

          // Check authorization
          const isPresident = await isOrganizationPresident(
            headers,
            organizationId,
            userId
          )

          if (!isPresident) {
            throw new Error('Only society presidents can send emails')
          }

          // Validate variables in subject and body
          const subjectVariables = validateVariables(subject)
          const bodyVariables = validateVariables(bodyHtml)
          const invalidVariables = [...subjectVariables, ...bodyVariables]

          if (invalidVariables.length > 0) {
            throw new Error(`Invalid variables: ${invalidVariables.join(', ')}`)
          }

          // Check if there are recipients
          const memberCount = await getOrganizationMemberCount(organizationId)
          if (memberCount === 0) {
            throw new Error('No active members to send email to')
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
            console.error(
              { error, organizationId, userId },
              'Failed to send email'
            )
            throw new Error('Failed to send email')
          }
        },
        {
          body: sendEmailSchema,
          detail: {
            tags: ['Society Email'],
            summary: 'Send Society Email',
            description: 'Send mass email to all society members'
          }
        }
      )

      /**
       * Preview email with sample data
       * POST /email/preview
       */
      .post(
        '/preview',
        async ({ body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const { organizationId, subject, bodyHtml } = body
          const userId = user.id

          // Check authorization
          const isPresident = await isOrganizationPresident(
            headers,
            organizationId,
            userId
          )

          if (!isPresident) {
            throw new Error('Only society presidents can preview emails')
          }

          // Get organization name
          const org = await db.query.organization.findFirst({
            where: eq(organization.id, organizationId),
            columns: {
              name: true
            }
          })

          if (!org) {
            throw new Error('Organization not found')
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

          const previewSubject = replaceVariables(subject, sampleData, false)
          const previewHtml = replaceVariables(bodyHtml, sampleData, true)

          return {
            previewSubject,
            previewHtml,
            sampleData
          }
        },
        {
          body: previewEmailSchema,
          detail: {
            tags: ['Society Email'],
            summary: 'Preview Email',
            description: 'Preview email with sample data'
          }
        }
      )

      /**
       * List sent emails for a society
       * GET /email/list
       */
      .get(
        '/list',
        async ({ query, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const { organizationId, limit, offset } = query
          const userId = user.id

          // Check authorization
          const isPresident = await isOrganizationPresident(
            headers,
            organizationId,
            userId
          )

          if (!isPresident) {
            throw new Error('Only society presidents can view email history')
          }

          // Get emails with sender info
          const rawEmails = await db
            .select({
              id: societyEmailTable.id,
              subject: societyEmailTable.subject,
              recipientCount: societyEmailTable.recipientCount,
              successCount: societyEmailTable.successCount,
              failureCount: societyEmailTable.failureCount,
              status: societyEmailTable.status,
              sentAt: societyEmailTable.sentAt,
              senderId: userTable.id,
              senderName: userTable.name,
              senderImage: userTable.image
            })
            .from(societyEmailTable)
            .innerJoin(userTable, eq(societyEmailTable.senderId, userTable.id))
            .where(eq(societyEmailTable.organizationId, organizationId))
            .orderBy(desc(societyEmailTable.sentAt))
            .limit(limit)
            .offset(offset)

          const emails = rawEmails.map((email) => ({
            id: email.id,
            subject: email.subject,
            recipientCount: email.recipientCount,
            successCount: email.successCount,
            failureCount: email.failureCount,
            status: email.status,
            sentAt: email.sentAt,
            sender: {
              id: email.senderId,
              name: email.senderName,
              image: email.senderImage
            }
          }))

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
        },
        {
          query: listEmailsSchema,
          detail: {
            tags: ['Society Email'],
            summary: 'List Society Emails',
            description: 'List sent emails for a society'
          }
        }
      )

      /**
       * Get email details with delivery status
       * GET /email/:emailId
       */
      .get(
        '/:emailId',
        async ({ params, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const { emailId } = params
          const userId = user.id

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
            throw new Error('Email not found')
          }

          // Check authorization
          const isPresident = await isOrganizationPresident(
            headers,
            email.organizationId,
            userId
          )

          if (!isPresident) {
            throw new Error('Only society presidents can view email details')
          }

          return email
        },
        {
          params: t.Object({
            emailId: t.String()
          }),
          detail: {
            tags: ['Society Email'],
            summary: 'Get Email Details',
            description: 'Get email details with delivery status'
          }
        }
      )
  )
