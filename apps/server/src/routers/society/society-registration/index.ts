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
} from '@rov/orpc-contracts'
import { and, eq } from 'drizzle-orm'
import { Elysia, t } from 'elysia'

const registrationService = new RegistrationService(db)
const joinRequestService = new JoinRequestService(db)
const paymentService = new PaymentVerificationService(db)
const qrCodeService = new QRCodeService()
const analyticsService = new RegistrationAnalyticsService(db)

/**
 * Check if user has permission to update organization
 */
async function hasOrganizationUpdatePermission(
  headers: Record<string, string | undefined>,
  organizationId: string
): Promise<boolean> {
  // Convert headers record to Headers object
  const headersObj = new Headers()
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      headersObj.set(key, value)
    }
  }

  const result = await auth.api.hasPermission({
    headers: headersObj,
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
  prefix: '/registration'
})
  .use(betterAuth)
  // ============================================================================
  // Registration Settings Management
  // ============================================================================
  .group('', { auth: true }, (app) =>
    app
      /**
       * Get registration settings for a society
       * GET /registration/settings
       */
      .get(
        '/settings',
        async ({ query, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const { societyId } = query
          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
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

          // Get society info and form info
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

          // Get member count
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
        {
          query: getRegistrationSettingsSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Get Registration Settings',
            description: 'Get registration settings for a society'
          }
        }
      )

      /**
       * Create registration settings for a society
       * POST /registration/settings
       */
      .post(
        '/settings',
        async ({ body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            body.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to configure registration settings'
            )
          }

          // Check if settings already exist
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
        {
          body: createRegistrationSettingsSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Create Registration Settings',
            description: 'Create registration settings for a society'
          }
        }
      )

      /**
       * Update registration settings
       * PATCH /registration/settings/:id
       */
      .patch(
        '/settings/:id',
        async ({ params, body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          // Get existing settings to check society
          const existing = await registrationService.getRegistrationSettings(
            params.id
          )
          if (!existing) {
            throw new Error('Registration settings not found')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            existing.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to update registration settings'
            )
          }

          await registrationService.updateRegistrationSettings(params.id, {
            id: params.id,
            ...body
          })

          return { success: true }
        },
        {
          params: t.Object({
            id: t.String()
          }),
          body: updateRegistrationSettingsSchema.omit({ id: true }),
          detail: {
            tags: ['Society Registration'],
            summary: 'Update Registration Settings',
            description: 'Update registration settings'
          }
        }
      )
  )
  // ============================================================================
  // Join Request Management
  // ============================================================================
  .group('', { auth: true }, (app) =>
    app
      /**
       * Create a join request
       * POST /registration/join-request
       */
      .post(
        '/join-request',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          // Check if registration is open
          const isOpen = await registrationService.isRegistrationOpen(
            body.societyId
          )
          if (!isOpen) {
            throw new Error('Registration is currently closed')
          }

          // Check capacity
          const capacity = await registrationService.checkCapacity(
            body.societyId
          )
          if (capacity.isFull) {
            throw new Error('Registration has reached capacity')
          }

          // Check if already a member
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
        {
          body: createJoinRequestSchema.omit({ userId: true }),
          detail: {
            tags: ['Society Registration'],
            summary: 'Create Join Request',
            description: 'Create a join request'
          }
        }
      )

      /**
       * Create a simple join request without forms
       * POST /registration/join-request/simple
       */
      .post(
        '/join-request/simple',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          // Check if already a member
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
        {
          body: simpleRequestToJoinSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Simple Request to Join',
            description:
              'Create a simple join request without forms (always enabled)'
          }
        }
      )

      /**
       * List join requests for a society
       * GET /registration/join-request
       */
      .get(
        '/join-request',
        async ({ query, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
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
        {
          query: listJoinRequestsSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'List Join Requests',
            description: 'List join requests for a society'
          }
        }
      )

      /**
       * Get a single join request
       * GET /registration/join-request/:id
       */
      .get(
        '/join-request/:id',
        async ({ params, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) {
            throw new Error('Join request not found')
          }

          // Check permission (organization update permission or the applicant)
          const hasOrgPermission = await hasOrganizationUpdatePermission(
            headers,
            request.societyId
          )
          const isApplicant = request.userId === userId

          if (!(hasOrgPermission || isApplicant)) {
            throw new Error(
              'You do not have permission to view this join request'
            )
          }

          // Get user info
          const applicantUser = await db.query.user.findFirst({
            where: eq(userTable.id, request.userId)
          })

          if (!applicantUser) {
            throw new Error('User not found')
          }

          // Get form response if it exists
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
        {
          params: t.Object({
            id: t.String()
          }),
          detail: {
            tags: ['Society Registration'],
            summary: 'Get Join Request',
            description: 'Get a single join request'
          }
        }
      )

      /**
       * Approve a join request
       * POST /registration/join-request/:id/approve
       */
      .post(
        '/join-request/:id/approve',
        async ({ params, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) {
            throw new Error('Join request not found')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
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
            userId
          )

          return {
            success: true,
            memberId
          }
        },
        {
          params: t.Object({
            id: t.String()
          }),
          detail: {
            tags: ['Society Registration'],
            summary: 'Approve Join Request',
            description: 'Approve a join request'
          }
        }
      )

      /**
       * Reject a join request
       * POST /registration/join-request/:id/reject
       */
      .post(
        '/join-request/:id/reject',
        async ({ params, body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) {
            throw new Error('Join request not found')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            request.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to reject join requests'
            )
          }

          await joinRequestService.rejectJoinRequest(
            params.id,
            userId,
            body.reason
          )

          return { success: true }
        },
        {
          params: t.Object({
            id: t.String()
          }),
          body: rejectJoinRequestSchema.omit({ id: true }),
          detail: {
            tags: ['Society Registration'],
            summary: 'Reject Join Request',
            description: 'Reject a join request'
          }
        }
      )

      /**
       * Bulk approve join requests
       * POST /registration/join-request/bulk-approve
       */
      .post(
        '/join-request/bulk-approve',
        async ({ body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          // Check permission for first request (assume all are from same society)
          const firstRequest = await joinRequestService.getJoinRequest(
            body.ids[0]
          )
          if (!firstRequest) {
            throw new Error('Join request not found')
          }

          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            firstRequest.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to approve join requests'
            )
          }

          const result = await joinRequestService.bulkApproveRequests(
            body.ids,
            userId
          )

          return result
        },
        {
          body: bulkApproveJoinRequestsSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Bulk Approve Join Requests',
            description: 'Bulk approve join requests'
          }
        }
      )

      /**
       * Bulk reject join requests
       * POST /registration/join-request/bulk-reject
       */
      .post(
        '/join-request/bulk-reject',
        async ({ body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          // Check permission for first request
          const firstRequest = await joinRequestService.getJoinRequest(
            body.ids[0]
          )
          if (!firstRequest) {
            throw new Error('Join request not found')
          }

          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            firstRequest.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to reject join requests'
            )
          }

          const result = await joinRequestService.bulkRejectRequests(
            body.ids,
            userId,
            body.reason
          )

          return result
        },
        {
          body: bulkRejectJoinRequestsSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Bulk Reject Join Requests',
            description: 'Bulk reject join requests'
          }
        }
      )

      /**
       * Get user's join request status for a society
       * GET /registration/join-request/user-status
       */
      .get(
        '/join-request/user-status',
        async ({ query, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          const status = await joinRequestService.getUserJoinRequestStatus(
            query.userId || userId,
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
        {
          query: getUserJoinRequestStatusSchema.partial({ userId: true }),
          detail: {
            tags: ['Society Registration'],
            summary: 'Get User Join Request Status',
            description: "Get user's join request status for a society"
          }
        }
      )

      /**
       * Verify payment for a join request
       * POST /registration/payment/:id/verify
       */
      .post(
        '/payment/:id/verify',
        async ({ params, body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) {
            throw new Error('Join request not found')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            request.societyId
          )
          if (!hasPermission) {
            throw new Error('You do not have permission to verify payments')
          }

          await paymentService.markPaymentAsVerified(
            params.id,
            userId,
            body.notes
          )

          // Check if auto-approval is enabled
          const settings = await registrationService.getRegistrationSettings(
            request.societyId
          )

          if (settings?.approvalMode === 'auto') {
            // Auto-approve the request
            try {
              await joinRequestService.approveJoinRequest(params.id, userId)
            } catch (_error) {
              // Silently fail auto-approval - payment verification succeeded
            }
          }

          return { success: true }
        },
        {
          params: t.Object({
            id: t.String()
          }),
          body: verifyPaymentSchema.omit({ id: true }),
          detail: {
            tags: ['Society Registration'],
            summary: 'Verify Payment',
            description: 'Verify payment for a join request'
          }
        }
      )

      /**
       * Mark payment as not verified
       * POST /registration/payment/:id/unverify
       */
      .post(
        '/payment/:id/unverify',
        async ({ params, body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) {
            throw new Error('Join request not found')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            request.societyId
          )
          if (!hasPermission) {
            throw new Error('You do not have permission to verify payments')
          }

          await paymentService.markPaymentAsNotVerified(
            params.id,
            userId,
            body.reason
          )

          return { success: true }
        },
        {
          params: t.Object({
            id: t.String()
          }),
          body: markPaymentNotVerifiedSchema.omit({ id: true }),
          detail: {
            tags: ['Society Registration'],
            summary: 'Mark Payment Not Verified',
            description: 'Mark payment as not verified'
          }
        }
      )

      /**
       * Upload payment proof
       * POST /registration/payment/:id/proof
       */
      .post(
        '/payment/:id/proof',
        async ({ params, body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id

          const request = await joinRequestService.getJoinRequest(params.id)
          if (!request) {
            throw new Error('Join request not found')
          }

          // Check permission (must be the applicant)
          if (request.userId !== userId) {
            throw new Error(
              'You do not have permission to upload payment proof for this request'
            )
          }

          await paymentService.uploadPaymentProof(params.id, body.proofUrl)

          return { success: true }
        },
        {
          params: t.Object({
            id: t.String()
          }),
          body: uploadPaymentProofSchema.omit({ id: true }),
          detail: {
            tags: ['Society Registration'],
            summary: 'Upload Payment Proof',
            description: 'Upload payment proof'
          }
        }
      )

      /**
       * Get registration analytics for a society
       * GET /registration/analytics
       */
      .get(
        '/analytics',
        async ({ query, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            query.societyId
          )
          if (!hasPermission) {
            throw new Error('You do not have permission to view analytics')
          }

          const metrics = await analyticsService.getRegistrationMetrics(
            query.societyId,
            {
              dateFrom: query.dateFrom,
              dateTo: query.dateTo
            }
          )

          const trends = await analyticsService.getApplicationTrends(
            query.societyId,
            {
              dateFrom: query.dateFrom,
              dateTo: query.dateTo
            }
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
        {
          query: getRegistrationAnalyticsSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Get Registration Analytics',
            description: 'Get registration analytics for a society'
          }
        }
      )

      /**
       * Export join requests to CSV or Excel
       * POST /registration/export
       */
      .post(
        '/export',
        async ({ body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            body.societyId
          )
          if (!hasPermission) {
            throw new Error(
              'You do not have permission to export join requests'
            )
          }

          // TODO: Implement actual export functionality
          // For now, return placeholder
          return {
            fileUrl: '/exports/placeholder.csv',
            fileName: `join-requests-${body.societyId}-${Date.now()}.${body.format}`
          }
        },
        {
          body: exportJoinRequestsSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Export Join Requests',
            description: 'Export join requests to CSV or Excel'
          }
        }
      )
  )
  // ============================================================================
  // Public Registration Page (no auth required)
  // ============================================================================
  .group('/public', (app) =>
    app
      /**
       * Check if registration is available for a society
       * GET /registration/public/availability
       */
      .get(
        '/availability',
        async ({ query }) => {
          const result =
            await registrationService.checkRegistrationAvailability(
              query.societySlug
            )

          return result
        },
        {
          query: checkRegistrationAvailabilitySchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Check Registration Availability',
            description: 'Check if registration is available for a society'
          }
        }
      )

      /**
       * Get public registration page data
       * GET /registration/public/page-data
       */
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
        {
          query: getPublicRegistrationPageSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Get Public Registration Page',
            description: 'Get public registration page data'
          }
        }
      )
  )
  // ============================================================================
  // QR Code Generation
  // ============================================================================
  .group('', { auth: true }, (app) =>
    app
      /**
       * Generate QR code for registration URL
       * POST /registration/qr-code
       */
      .post(
        '/qr-code',
        async ({ body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            body.societyId
          )

          if (!hasPermission) {
            throw new Error('You do not have permission to generate QR codes')
          }

          // Get society
          const society = await db.query.organization.findFirst({
            where: eq(organization.id, body.societyId)
          })

          if (!society?.slug) {
            throw new Error('Society not found or missing slug')
          }

          const registrationUrl = `${env.WEB_URL || 'http://localhost:3000'}/join/${society.slug}`

          return {
            registrationUrl,
            societyName: society.name,
            societyLogo: society.logo || null
          }
        },
        {
          body: generateQRCodeSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Generate QR Code',
            description: 'Generate QR code for registration URL'
          }
        }
      )

      /**
       * Generate printable QR code with society branding
       * POST /registration/qr-code/printable
       */
      .post(
        '/qr-code/printable',
        async ({ body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            headers,
            body.societyId
          )
          if (!hasPermission) {
            throw new Error('You do not have permission to generate QR codes')
          }

          // Get society
          const society = await db.query.organization.findFirst({
            where: eq(organization.id, body.societyId)
          })

          if (!society?.slug) {
            throw new Error('Society not found or missing slug')
          }

          const registrationUrl = `${env.WEB_URL || 'http://localhost:3000'}/join/${society.slug}`

          const html = qrCodeService.generatePrintableQRCode(registrationUrl, {
            name: society.name,
            logo: society.logo || undefined,
            description: society.description || undefined
          })

          return { html }
        },
        {
          body: generatePrintableQRCodeSchema,
          detail: {
            tags: ['Society Registration'],
            summary: 'Generate Printable QR Code',
            description: 'Generate printable QR code with society branding'
          }
        }
      )
  )
