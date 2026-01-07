import { db } from '@api/db'
import { auth } from '@api/lib/auth'
import { env } from '@api/lib/env'
import { betterAuth } from '@api/middleware/auth'
import {
  JoinRequestService,
  PaymentVerificationService,
  QRCodeService,
  RegistrationAnalyticsService,
  RegistrationService
} from '@api/services/society-registration'
import {
  formResponses,
  forms,
  member as memberTable,
  organization,
  user as userTable
} from '@rov/db'
import {
  approveJoinRequestSchema,
  bulkApproveJoinRequestsSchema,
  bulkRejectJoinRequestsSchema,
  checkRegistrationAvailabilitySchema,
  createJoinRequestSchema,
  createRegistrationSettingsSchema,
  exportJoinRequestsSchema,
  generatePrintableQRCodeSchema,
  generateQRCodeSchema,
  getJoinRequestSchema,
  getPublicRegistrationPageSchema,
  getRegistrationAnalyticsSchema,
  getRegistrationSettingsSchema,
  getUserJoinRequestStatusSchema,
  listJoinRequestsSchema,
  markPaymentNotVerifiedSchema,
  rejectJoinRequestSchema,
  simpleRequestToJoinSchema,
  updateRegistrationSettingsSchema,
  uploadPaymentProofSchema,
  verifyPaymentSchema
} from '@rov/orpc-contracts/society-registration/schemas'
import { and, eq } from 'drizzle-orm'
import { Elysia } from 'elysia'

const registrationService = new RegistrationService(db)
const joinRequestService = new JoinRequestService(db)
const paymentService = new PaymentVerificationService(db)
const qrCodeService = new QRCodeService()
const analyticsService = new RegistrationAnalyticsService(db)

// Helper to convert Elysia headers to Headers object
function toHeaders(headers: Record<string, string | undefined>): Headers {
  const h = new Headers()
  for (const [k, v] of Object.entries(headers)) {
    if (v) h.append(k, v)
  }
  return h
}

/**
 * Check if user has permission to update organization
 */
async function hasOrganizationUpdatePermission(
  headers: Headers,
  organizationId: string
): Promise<boolean> {
  const result = await auth.api.hasPermission({
    headers,
    body: {
      permissions: {
        organization: ['update']
      },
      organizationId
    }
  })

  return result?.success === true
}

export const societyRegistrationRouter = new Elysia({
  prefix: '/society-registration'
})
  // Public Routes
  .group('/public', (app) =>
    app
      .get(
        '/check-availability',
        async ({ query }) => {
          return await registrationService.checkRegistrationAvailability(
            query.societySlug
          )
        },
        { query: checkRegistrationAvailabilitySchema }
      )
      .get(
        '/page-data',
        async ({ query }) => {
          // Get society by slug
          const society = await db.query.organization.findFirst({
            where: eq(organization.slug, query.societySlug)
          })

          if (!society) {
            throw new Error('Society not found')
          }

          // Get registration settings
          const settings = await registrationService.getRegistrationSettings(
            society.id
          )

          // Get capacity
          const capacity = await registrationService.checkCapacity(society.id)

          // Get form if configured
          const form = settings?.formId
            ? await db.query.forms.findFirst({
                where: eq(forms.id, settings.formId)
              })
            : null

          // Check availability
          const availability =
            await registrationService.checkRegistrationAvailability(
              query.societySlug
            )

          return {
            society: {
              id: society.id,
              name: society.name,
              slug: society.slug || null,
              logo: society.logo || null,
              banner: society.banner || null,
              description: society.description || null,
              memberCount: capacity.current,
              meetingSchedule: society.meetingSchedule || null,
              membershipRequirements: society.membershipRequirements || null,
              goals: society.goals || null,
              instagram: society.instagram || null,
              facebook: society.facebook || null,
              twitter: society.twitter || null,
              linkedin: society.linkedin || null,
              website: society.website || null,
              primaryColor: society.primaryColor || null
            },
            settings: {
              isEnabled: settings?.isEnabled ?? false,
              isPaused: settings?.isPaused ?? false,
              welcomeMessage: settings?.welcomeMessage || null,
              customBanner: settings?.customBanner || null,
              maxCapacity: settings?.maxCapacity || null,
              currentMemberCount: capacity.current,
              remainingSlots:
                capacity.max !== null ? capacity.max - capacity.current : null,
              startDate: settings?.startDate?.toString() || null,
              endDate: settings?.endDate?.toString() || null
            },
            form: form
              ? {
                  id: form.id,
                  title: form.title,
                  description: form.description,
                  paymentEnabled: form.paymentEnabled ?? false,
                  paymentAmount: form.paymentAmount || null
                }
              : null,
            isAvailable: availability.isAvailable,
            unavailableReason: availability.message
          }
        },
        { query: getPublicRegistrationPageSchema }
      )
  )

  // Protected Routes
  .use(betterAuth)
  // Settings
  .group('/settings', (app) =>
    app
      .get(
        '',
        async ({ query, headers: elysiaHeaders }) => {
          const { societyId } = query

          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to view registration settings'
            )
          }

          const settings =
            await registrationService.getRegistrationSettings(societyId)

          if (!settings) {
            throw new Error('Registration settings not found')
          }

          const society = await db.query.organization.findFirst({
            where: eq(organization.id, societyId)
          })

          const form = settings.formId
            ? await db.query.forms.findFirst({
                where: eq(forms.id, settings.formId)
              })
            : null

          if (!society) {
            throw new Error('Society not found')
          }

          const capacity = await registrationService.checkCapacity(societyId)

          return {
            ...settings,
            notificationsEnabled: settings.notificationsEnabled ?? false,
            createdAt: settings.createdAt.toString(),
            updatedAt: settings.updatedAt.toString(),
            startDate: settings.startDate?.toString() || null,
            endDate: settings.endDate?.toString() || null,
            society: {
              id: society.id,
              name: society.name,
              slug: society.slug || null,
              logo: society.logo || null,
              banner: society.banner || null,
              description: society.description || null,
              primaryColor: society.primaryColor || null,
              memberCount: capacity.current
            },
            form: form
              ? {
                  id: form.id,
                  title: form.title,
                  description: form.description,
                  paymentEnabled: form.paymentEnabled ?? false,
                  paymentAmount: form.paymentAmount || null
                }
              : null
          }
        },
        { query: getRegistrationSettingsSchema }
      )
      .post(
        '',
        async ({ body, headers: elysiaHeaders }) => {
          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            body.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to configure registration settings'
            )
          }

          const existing = await registrationService.getRegistrationSettings(
            body.societyId
          )
          if (existing) {
            throw new Error(
              'Registration settings already exist for this society'
            )
          }

          const settings =
            await registrationService.createRegistrationSettings(body)

          return {
            id: settings.id,
            societyId: settings.societyId
          }
        },
        { body: createRegistrationSettingsSchema }
      )
      .patch(
        '',
        async ({ body, headers: elysiaHeaders }) => {
          const existing = await registrationService.getRegistrationSettings(
            body.id
          )
          if (!existing) {
            throw new Error('Registration settings not found')
          }

          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            existing.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to update registration settings'
            )
          }

          await registrationService.updateRegistrationSettings(body.id, body)

          return { success: true }
        },
        { body: updateRegistrationSettingsSchema }
      )
  )

  // Join Requests
  .group('/join-requests', { auth: true }, (app) =>
    app
      .post(
        '',
        async ({ body, user }) => {
          const userId = user.id

          const isOpen = await registrationService.isRegistrationOpen(
            body.societyId
          )
          if (!isOpen) {
            throw new Error('Registration is currently closed')
          }

          const capacity = await registrationService.checkCapacity(
            body.societyId
          )
          if (capacity.isFull) {
            throw new Error('Registration has reached capacity')
          }

          const existingMember = await db.query.member.findFirst({
            where: and(
              eq(memberTable.organizationId, body.societyId),
              eq(memberTable.userId, userId)
            )
          })
          if (existingMember) {
            throw new Error('You are already a member of this society')
          }

          try {
            const request = await joinRequestService.createJoinRequest({
              ...body,
              userId
            })

            return {
              id: request.id,
              status: request.status,
              requiresPayment: request.paymentStatus !== 'not_required'
            }
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes('pending join request')
            ) {
              throw new Error('You already have a pending join request')
            }
            throw error
          }
        },
        { body: createJoinRequestSchema }
      )
      .post(
        '/simple',
        async ({ body, user }) => {
          const userId = user.id

          const existingMember = await db.query.member.findFirst({
            where: and(
              eq(memberTable.organizationId, body.societyId),
              eq(memberTable.userId, userId)
            )
          })
          if (existingMember) {
            throw new Error('You are already a member of this society')
          }

          try {
            const request = await joinRequestService.createJoinRequest({
              societyId: body.societyId,
              userId,
              formResponseId: undefined,
              paymentAmount: undefined
            })

            return {
              id: request.id,
              status: request.status,
              requiresPayment: request.paymentStatus !== 'not_required'
            }
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes('pending join request')
            ) {
              throw new Error('You already have a pending join request')
            }
            throw error
          }
        },
        { body: simpleRequestToJoinSchema }
      )
      .get(
        '/list',
        async ({ query, headers: elysiaHeaders }) => {
          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            query.societyId
          )
          if (!hasPermission) {
            throw new Error('You do not have permission to view join requests')
          }

          const result = await joinRequestService.listJoinRequests(query)

          return {
            requests: result.requests.map((r) => ({
              id: r.id,
              userId: r.userId,
              userName: r.user.name,
              userEmail: r.user.email,
              userImage: null,
              status: r.status,
              paymentStatus: r.paymentStatus,
              paymentAmount: r.paymentAmount || null,
              submittedAt: r.submittedAt.toString(),
              reviewedAt: r.reviewedAt?.toString() || null
            })),
            total: result.total,
            hasMore: result.hasMore
          }
        },
        { query: listJoinRequestsSchema }
      )
      .get(
        '/status',
        async ({ query, user }) => {
          const status = await joinRequestService.getUserJoinRequestStatus(
            query.userId || user.id,
            query.societyId
          )
          return {
            hasRequest: status.hasRequest,
            status: status.status,
            requestId: status.requestId,
            submittedAt: status.submittedAt?.toString() || null,
            rejectionReason: status.rejectionReason
          }
        },
        { query: getUserJoinRequestStatusSchema }
      )
      .get(
        '/:id',
        async ({ params, headers: elysiaHeaders, user }) => {
          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) {
            throw new Error('Join request not found')
          }
          const h = toHeaders(elysiaHeaders)
          const hasOrgPermission = await hasOrganizationUpdatePermission(
            h,
            request.societyId
          )
          const isApplicant = request.userId === user.id

          if (!(hasOrgPermission || isApplicant)) {
            throw new Error(
              'You do not have permission to view this join request'
            )
          }

          const applicantUser = await db.query.user.findFirst({
            where: eq(userTable.id, request.userId)
          })

          if (!applicantUser) {
            throw new Error('User not found')
          }

          const formResponse = request.formResponseId
            ? await db.query.formResponses.findFirst({
                where: eq(formResponses.id, request.formResponseId)
              })
            : null

          return {
            ...request,
            createdAt: request.createdAt.toString(),
            updatedAt: request.updatedAt.toString(),
            submittedAt: request.submittedAt.toString(),
            reviewedAt: request.reviewedAt?.toString() || null,
            paymentVerifiedAt: request.paymentVerifiedAt?.toString() || null,
            user: {
              id: applicantUser.id,
              name: applicantUser.name,
              email: applicantUser.email,
              image: applicantUser.image || null,
              phoneNumber: applicantUser.phoneNumber || null
            },
            formResponse: formResponse
              ? {
                  id: formResponse.id,
                  answers: formResponse.answers as Record<string, unknown>
                }
              : null,
            reviewer: null,
            paymentVerifier: null
          }
        },
        { params: getJoinRequestSchema }
      )
      .post(
        '/:id/approve',
        async ({ params, headers: elysiaHeaders, user }) => {
          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) {
            throw new Error('Join request not found')
          }

          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            request.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to approve join requests'
            )
          }

          if (
            request.status !== 'pending' &&
            request.status !== 'payment_completed'
          ) {
            throw new Error(
              'Join request cannot be approved in its current status'
            )
          }

          const memberId = await joinRequestService.approveJoinRequest(
            params.id,
            user.id
          )

          return {
            success: true,
            memberId
          }
        },
        { params: approveJoinRequestSchema }
      )
      .post(
        '/:id/reject',
        async ({ params, body, headers: elysiaHeaders, user }) => {
          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) {
            throw new Error('Join request not found')
          }

          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            request.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to reject join requests'
            )
          }

          await joinRequestService.rejectJoinRequest(
            params.id,
            user.id,
            body.reason
          )

          return { success: true }
        },
        {
          params: rejectJoinRequestSchema.pick({ id: true }),
          body: rejectJoinRequestSchema.pick({ reason: true })
        }
      )
      .post(
        '/bulk-approve',
        async ({ body, headers: elysiaHeaders, user }) => {
          const firstRequest = await joinRequestService.getJoinRequest(
            body.ids[0]
          )
          if (!firstRequest) {
            throw new Error('Join request not found')
          }
          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            firstRequest.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to approve join requests'
            )
          }
          const result = await joinRequestService.bulkApproveRequests(
            body.ids,
            user.id
          )
          return result
        },
        { body: bulkApproveJoinRequestsSchema }
      )
      .post(
        '/bulk-reject',
        async ({ body, headers: elysiaHeaders, user }) => {
          const firstRequest = await joinRequestService.getJoinRequest(
            body.ids[0]
          )
          if (!firstRequest) {
            throw new Error('Join request not found')
          }
          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            firstRequest.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to reject join requests'
            )
          }
          const result = await joinRequestService.bulkRejectRequests(
            body.ids,
            user.id,
            body.reason
          )
          return result
        },
        { body: bulkRejectJoinRequestsSchema }
      )
  )

  // Payment
  .group('/payment', { auth: true }, (app) =>
    app
      .post(
        '/:id/verify',
        async ({ params, body, headers: elysiaHeaders, user }) => {
          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) throw new Error('Join request not found')

          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            request.societyId
          )
          if (!hasPermission)
            throw new Error('You do not have permission to verify payments')

          await paymentService.markPaymentAsVerified(
            params.id,
            user.id,
            body.notes
          )

          const settings = await registrationService.getRegistrationSettings(
            request.societyId
          )
          if (settings?.approvalMode === 'auto') {
            try {
              await joinRequestService.approveJoinRequest(params.id, user.id)
            } catch {}
          }
          return { success: true }
        },
        {
          params: verifyPaymentSchema.pick({ id: true }),
          body: verifyPaymentSchema.pick({ notes: true })
        }
      )
      .post(
        '/:id/unverify',
        async ({ params, body, headers: elysiaHeaders, user }) => {
          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) throw new Error('Join request not found')

          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            request.societyId
          )
          if (!hasPermission)
            throw new Error('You do not have permission to verify payments')

          await paymentService.markPaymentAsNotVerified(
            params.id,
            user.id,
            body.reason
          )
          return { success: true }
        },
        {
          params: markPaymentNotVerifiedSchema.pick({ id: true }),
          body: markPaymentNotVerifiedSchema.pick({ reason: true })
        }
      )
      .post(
        '/:id/proof',
        async ({ params, body, user }) => {
          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) throw new Error('Join request not found')

          if (request.userId !== user.id) {
            throw new Error(
              'You do not have permission to upload payment proof for this request'
            )
          }
          await paymentService.uploadPaymentProof(params.id, body.proofUrl)
          return { success: true }
        },
        {
          params: uploadPaymentProofSchema.pick({ id: true }),
          body: uploadPaymentProofSchema.pick({ proofUrl: true })
        }
      )
  )

  // QR Code
  .group('/qr-code', (app) =>
    app
      .post(
        '',
        async ({ body, headers: elysiaHeaders }) => {
          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            body.societyId
          )
          if (!hasPermission)
            throw new Error('You do not have permission to generate QR codes')

          const society = await db.query.organization.findFirst({
            where: eq(organization.id, body.societyId)
          })
          if (!society?.slug)
            throw new Error('Society not found or missing slug')

          const registrationUrl = `${env.WEB_URL || 'http://localhost:3000'}/join/${society.slug}`

          const qrCode = await qrCodeService.generateQRCode(registrationUrl, {
            format: body.format,
            width: body.size
          })

          return {
            qrCode: qrCode.toString('base64'),
            format: body.format,
            registrationUrl
          }
        },
        { body: generateQRCodeSchema }
      )
      .post(
        '/printable',
        async ({ body, headers: elysiaHeaders }) => {
          const h = toHeaders(elysiaHeaders)
          const hasPermission = await hasOrganizationUpdatePermission(
            h,
            body.societyId
          )
          if (!hasPermission)
            throw new Error('You do not have permission to generate QR codes')
          const society = await db.query.organization.findFirst({
            where: eq(organization.id, body.societyId)
          })
          if (!society?.slug)
            throw new Error('Society not found or missing slug')
          const registrationUrl = `${env.WEB_URL || 'http://localhost:3000'}/join/${society.slug}`
          const html = qrCodeService.generatePrintableQRCode(registrationUrl, {
            name: society.name,
            logo: society.logo || undefined,
            description: society.description || undefined
          })
          return { html }
        },
        { body: generatePrintableQRCodeSchema }
      )
  )

  // Analytics
  .get(
    '/analytics',
    async ({ query, headers: elysiaHeaders }) => {
      const h = toHeaders(elysiaHeaders)
      const hasPermission = await hasOrganizationUpdatePermission(
        h,
        query.societyId
      )
      if (!hasPermission)
        throw new Error('You do not have permission to view analytics')

      const metrics = await analyticsService.getRegistrationMetrics(
        query.societyId,
        { dateFrom: query.dateFrom, dateTo: query.dateTo }
      )
      const trends = await analyticsService.getApplicationTrends(
        query.societyId,
        { dateFrom: query.dateFrom, dateTo: query.dateTo }
      )
      return {
        ...metrics,
        applicationsByDate: trends,
        applicationsByStatus: [
          { status: 'pending' as const, count: metrics.pendingCount },
          { status: 'approved' as const, count: metrics.approvedCount },
          { status: 'rejected' as const, count: metrics.rejectedCount },
          {
            status: 'payment_pending' as const,
            count: metrics.paymentPendingCount
          }
        ]
      }
    },
    { query: getRegistrationAnalyticsSchema }
  )

  // Export
  .get(
    '/export',
    async ({ query, headers: elysiaHeaders }) => {
      const h = toHeaders(elysiaHeaders)
      const hasPermission = await hasOrganizationUpdatePermission(
        h,
        query.societyId
      )
      if (!hasPermission)
        throw new Error('You do not have permission to export join requests')

      // Placeholder logic assumed from original
      return {
        fileUrl: '/exports/placeholder.csv',
        fileName: `join-requests-${query.societyId}-${Date.now()}.${query.format}`
      }
    },
    { query: exportJoinRequestsSchema }
  )
