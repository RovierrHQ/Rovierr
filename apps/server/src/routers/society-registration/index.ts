import { ORPCError } from '@orpc/server'
import {
  formResponses,
  forms,
  member as memberTable,
  organization,
  user as userTable
} from '@rov/db'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { env } from '@/lib/env'
import { protectedProcedure, publicProcedure } from '@/lib/orpc'
import {
  JoinRequestService,
  PaymentVerificationService,
  QRCodeService,
  RegistrationAnalyticsService,
  RegistrationService
} from '@/services/society-registration'

const registrationService = new RegistrationService(db)
const joinRequestService = new JoinRequestService(db)
const paymentService = new PaymentVerificationService(db)
const qrCodeService = new QRCodeService()
const analyticsService = new RegistrationAnalyticsService(db)

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
      }
    },
    query: {
      organizationId
    }
  })

  return result?.success === true
}

export const societyRegistration = {
  // ============================================================================
  // Registration Settings Management
  // ============================================================================
  settings: {
    get: protectedProcedure.societyRegistration.settings.get.handler(
      async ({ input, context }) => {
        const { societyId } = input
        // Check permission
        const hasPermission = await hasOrganizationUpdatePermission(
          context.headers,
          societyId
        )
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to view registration settings'
          })
        }

        const settings =
          await registrationService.getRegistrationSettings(societyId)

        if (!settings) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Registration settings not found'
          })
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
          throw new ORPCError('NOT_FOUND', {
            message: 'Society not found'
          })
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
      }
    ),

    create: protectedProcedure.societyRegistration.settings.create.handler(
      async ({ input, context }) => {
        // Check permission
        const hasPermission = await hasOrganizationUpdatePermission(
          context.headers,
          input.societyId
        )
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message:
              'You do not have permission to configure registration settings'
          })
        }

        // Check if settings already exist
        const existing = await registrationService.getRegistrationSettings(
          input.societyId
        )
        if (existing) {
          throw new ORPCError('ALREADY_EXISTS', {
            message: 'Registration settings already exist for this society'
          })
        }

        const settings =
          await registrationService.createRegistrationSettings(input)

        return {
          id: settings.id,
          societyId: settings.societyId
        }
      }
    ),

    update: protectedProcedure.societyRegistration.settings.update.handler(
      async ({ input, context }) => {
        // Get existing settings to check society
        const existing = await registrationService.getRegistrationSettings(
          input.id
        )
        if (!existing) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Registration settings not found'
          })
        }

        // Check permission
        const hasPermission = await hasOrganizationUpdatePermission(
          context.headers,
          existing.societyId
        )
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message:
              'You do not have permission to update registration settings'
          })
        }

        await registrationService.updateRegistrationSettings(input.id, input)

        return { success: true }
      }
    )
  },

  // ============================================================================
  // Join Request Management
  // ============================================================================
  joinRequest: {
    create: protectedProcedure.societyRegistration.joinRequest.create.handler(
      async ({ input, context }) => {
        const userId = context.session.user.id

        // Check if registration is open
        const isOpen = await registrationService.isRegistrationOpen(
          input.societyId
        )
        if (!isOpen) {
          throw new ORPCError('REGISTRATION_CLOSED', {
            message: 'Registration is currently closed'
          })
        }

        // Check capacity
        const capacity = await registrationService.checkCapacity(
          input.societyId
        )
        if (capacity.isFull) {
          throw new ORPCError('REGISTRATION_FULL', {
            message: 'Registration has reached capacity'
          })
        }

        // Check if already a member
        const existingMember = await db.query.member.findFirst({
          where: and(
            eq(memberTable.organizationId, input.societyId),
            eq(memberTable.userId, userId)
          )
        })
        if (existingMember) {
          throw new ORPCError('ALREADY_MEMBER', {
            message: 'You are already a member of this society'
          })
        }

        try {
          const request = await joinRequestService.createJoinRequest({
            ...input,
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
            throw new ORPCError('DUPLICATE_REQUEST', {
              message: 'You already have a pending join request'
            })
          }
          throw error
        }
      }
    ),

    list: protectedProcedure.societyRegistration.joinRequest.list.handler(
      async ({ input, context }) => {
        // Check permission
        const hasPermission = await hasOrganizationUpdatePermission(
          context.headers,
          input.societyId
        )
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to view join requests'
          })
        }

        const result = await joinRequestService.listJoinRequests(input)

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
      }
    ),

    get: protectedProcedure.societyRegistration.joinRequest.get.handler(
      async ({ input, context }) => {
        const userId = context.session.user.id

        const request = await joinRequestService.getJoinRequest(input.id)
        if (!request) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Join request not found'
          })
        }

        // Check permission (organization update permission or the applicant)
        const hasOrgPermission = await hasOrganizationUpdatePermission(
          context.headers,
          request.societyId
        )
        const isApplicant = request.userId === userId

        if (!(hasOrgPermission || isApplicant)) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to view this join request'
          })
        }

        // Get user info
        const applicantUser = await db.query.user.findFirst({
          where: eq(userTable.id, request.userId)
        })

        if (!applicantUser) {
          throw new ORPCError('NOT_FOUND', {
            message: 'User not found'
          })
        }

        // Get form response
        const formResponse = await db.query.formResponses.findFirst({
          where: eq(formResponses.id, request.formResponseId)
        })

        if (!formResponse) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Form response not found'
          })
        }

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
          formResponse: {
            id: formResponse.id,
            answers: formResponse.answers as Record<string, unknown>
          },
          reviewer: null,
          paymentVerifier: null
        }
      }
    ),

    approve: protectedProcedure.societyRegistration.joinRequest.approve.handler(
      async ({ input, context }) => {
        const userId = context.session.user.id

        const request = await joinRequestService.getJoinRequest(input.id)
        if (!request) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Join request not found'
          })
        }

        // Check permission
        const hasPermission = await hasOrganizationUpdatePermission(
          context.headers,
          request.societyId
        )
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to approve join requests'
          })
        }

        if (
          request.status !== 'pending' &&
          request.status !== 'payment_completed'
        ) {
          throw new ORPCError('INVALID_STATUS', {
            message: 'Join request cannot be approved in its current status'
          })
        }

        const memberId = await joinRequestService.approveJoinRequest(
          input.id,
          userId
        )

        return {
          success: true,
          memberId
        }
      }
    ),

    reject: protectedProcedure.societyRegistration.joinRequest.reject.handler(
      async ({ input, context }) => {
        const userId = context.session.user.id

        const request = await joinRequestService.getJoinRequest(input.id)
        if (!request) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Join request not found'
          })
        }

        // Check permission
        const hasPermission = await hasOrganizationUpdatePermission(
          context.headers,
          request.societyId
        )
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to reject join requests'
          })
        }

        await joinRequestService.rejectJoinRequest(
          input.id,
          userId,
          input.reason
        )

        return { success: true }
      }
    ),

    bulkApprove:
      protectedProcedure.societyRegistration.joinRequest.bulkApprove.handler(
        async ({ input, context }) => {
          const userId = context.session.user.id

          // Check permission for first request (assume all are from same society)
          const firstRequest = await joinRequestService.getJoinRequest(
            input.ids[0]
          )
          if (!firstRequest) {
            throw new ORPCError('NOT_FOUND', {
              message: 'Join request not found'
            })
          }

          const hasPermission = await hasOrganizationUpdatePermission(
            context.headers,
            firstRequest.societyId
          )
          if (!hasPermission) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to approve join requests'
            })
          }

          const result = await joinRequestService.bulkApproveRequests(
            input.ids,
            userId
          )

          return result
        }
      ),

    bulkReject:
      protectedProcedure.societyRegistration.joinRequest.bulkReject.handler(
        async ({ input, context }) => {
          const userId = context.session.user.id

          // Check permission for first request
          const firstRequest = await joinRequestService.getJoinRequest(
            input.ids[0]
          )
          if (!firstRequest) {
            throw new ORPCError('NOT_FOUND', {
              message: 'Join request not found'
            })
          }

          const hasPermission = await hasOrganizationUpdatePermission(
            context.headers,
            firstRequest.societyId
          )
          if (!hasPermission) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to reject join requests'
            })
          }

          const result = await joinRequestService.bulkRejectRequests(
            input.ids,
            userId,
            input.reason
          )

          return result
        }
      ),

    getUserStatus:
      protectedProcedure.societyRegistration.joinRequest.getUserStatus.handler(
        async ({ input, context }) => {
          const userId = context.session.user.id

          const status = await joinRequestService.getUserJoinRequestStatus(
            input.userId || userId,
            input.societyId
          )

          return {
            hasRequest: status.hasRequest,
            status: status.status,
            requestId: status.requestId,
            submittedAt: status.submittedAt?.toString() || null,
            rejectionReason: status.rejectionReason
          }
        }
      )
  },

  // ============================================================================
  // Payment Verification
  // ============================================================================
  payment: {
    verify: protectedProcedure.societyRegistration.payment.verify.handler(
      async ({ input, context }) => {
        const userId = context.session.user.id

        const request = await joinRequestService.getJoinRequest(input.id)
        if (!request) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Join request not found'
          })
        }

        // Check permission
        const hasPermission = await hasOrganizationUpdatePermission(
          context.headers,
          request.societyId
        )
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to verify payments'
          })
        }

        await paymentService.markPaymentAsVerified(
          input.id,
          userId,
          input.notes
        )

        // Check if auto-approval is enabled
        const settings = await registrationService.getRegistrationSettings(
          request.societyId
        )

        if (settings?.approvalMode === 'auto') {
          // Auto-approve the request
          try {
            await joinRequestService.approveJoinRequest(input.id, userId)
          } catch (_error) {
            // Silently fail auto-approval - payment verification succeeded
          }
        }

        return { success: true }
      }
    ),

    markNotVerified:
      protectedProcedure.societyRegistration.payment.markNotVerified.handler(
        async ({ input, context }) => {
          const userId = context.session.user.id

          const request = await joinRequestService.getJoinRequest(input.id)
          if (!request) {
            throw new ORPCError('NOT_FOUND', {
              message: 'Join request not found'
            })
          }

          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            context.headers,
            request.societyId
          )
          if (!hasPermission) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to verify payments'
            })
          }

          await paymentService.markPaymentAsNotVerified(
            input.id,
            userId,
            input.reason
          )

          return { success: true }
        }
      ),

    uploadProof:
      protectedProcedure.societyRegistration.payment.uploadProof.handler(
        async ({ input, context }) => {
          const userId = context.session.user.id

          const request = await joinRequestService.getJoinRequest(input.id)
          if (!request) {
            throw new ORPCError('NOT_FOUND', {
              message: 'Join request not found'
            })
          }

          // Check permission (must be the applicant)
          if (request.userId !== userId) {
            throw new ORPCError('FORBIDDEN', {
              message:
                'You do not have permission to upload payment proof for this request'
            })
          }

          await paymentService.uploadPaymentProof(input.id, input.proofUrl)

          return { success: true }
        }
      )
  },

  // ============================================================================
  // Public Registration Page
  // ============================================================================
  public: {
    checkAvailability:
      publicProcedure.societyRegistration.public.checkAvailability.handler(
        async ({ input }) => {
          const result =
            await registrationService.checkRegistrationAvailability(
              input.societySlug
            )

          return result
        }
      ),

    getPageData: publicProcedure.societyRegistration.public.getPageData.handler(
      async ({ input }) => {
        // Get society by slug
        const society = await db.query.organization.findFirst({
          where: eq(organization.slug, input.societySlug)
        })

        if (!society) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Society not found'
          })
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
            input.societySlug
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
      }
    )
  },

  // ============================================================================
  // QR Code Generation
  // ============================================================================
  qrCode: {
    generate: protectedProcedure.societyRegistration.qrCode.generate.handler(
      async ({ input, context }) => {
        // Check permission
        const hasPermission = await hasOrganizationUpdatePermission(
          context.headers,
          input.societyId
        )

        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to generate QR codes'
          })
        }

        // Get society
        const society = await db.query.organization.findFirst({
          where: eq(organization.id, input.societyId)
        })

        if (!society?.slug) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Society not found or missing slug'
          })
        }

        const registrationUrl = `${env.WEB_URL || 'http://localhost:3000'}/join/${society.slug}`

        return {
          registrationUrl,
          societyName: society.name,
          societyLogo: society.logo || null
        }
      }
    ),

    generatePrintable:
      protectedProcedure.societyRegistration.qrCode.generatePrintable.handler(
        async ({ input, context }) => {
          // Check permission
          const hasPermission = await hasOrganizationUpdatePermission(
            context.headers,
            input.societyId
          )
          if (!hasPermission) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to generate QR codes'
            })
          }

          // Get society
          const society = await db.query.organization.findFirst({
            where: eq(organization.id, input.societyId)
          })

          if (!society?.slug) {
            throw new ORPCError('NOT_FOUND', {
              message: 'Society not found or missing slug'
            })
          }

          const registrationUrl = `${env.WEB_URL || 'http://localhost:3000'}/join/${society.slug}`

          const html = qrCodeService.generatePrintableQRCode(registrationUrl, {
            name: society.name,
            logo: society.logo || undefined,
            description: society.description || undefined
          })

          return { html }
        }
      )
  },

  // ============================================================================
  // Analytics
  // ============================================================================
  analytics: protectedProcedure.societyRegistration.analytics.handler(
    async ({ input, context }) => {
      // Check permission
      const hasPermission = await hasOrganizationUpdatePermission(
        context.headers,
        input.societyId
      )
      if (!hasPermission) {
        throw new ORPCError('FORBIDDEN', {
          message: 'You do not have permission to view analytics'
        })
      }

      const metrics = await analyticsService.getRegistrationMetrics(
        input.societyId,
        {
          dateFrom: input.dateFrom,
          dateTo: input.dateTo
        }
      )

      const trends = await analyticsService.getApplicationTrends(
        input.societyId,
        {
          dateFrom: input.dateFrom,
          dateTo: input.dateTo
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
    }
  ),

  // ============================================================================
  // Export
  // ============================================================================
  export: protectedProcedure.societyRegistration.export.handler(
    async ({ input, context }) => {
      // Check permission
      const hasPermission = await hasOrganizationUpdatePermission(
        context.headers,
        input.societyId
      )
      if (!hasPermission) {
        throw new ORPCError('FORBIDDEN', {
          message: 'You do not have permission to export join requests'
        })
      }

      // TODO: Implement actual export functionality
      // For now, return placeholder
      return {
        fileUrl: '/exports/placeholder.csv',
        fileName: `join-requests-${input.societyId}-${Date.now()}.${input.format}`
      }
    }
  )
}
