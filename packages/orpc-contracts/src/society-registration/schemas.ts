/**
 * Society Registration Schemas
 *
 * This file uses Drizzle-generated schemas as the source of truth and extends them
 * for API-specific use cases.
 */

import { z } from 'zod'
import {
  updateRegistrationSettingsSchema as generatedUpdateRegistrationSettingsSchema,
  insertJoinRequestSchema,
  insertRegistrationSettingsSchema,
  selectJoinRequestSchema,
  selectRegistrationSettingsSchema
} from './generated-schemas'

// ============================================================================
// Enum Schemas - Extracted from generated schemas
// ============================================================================

export const approvalModeSchema =
  selectRegistrationSettingsSchema.shape.approvalMode
export const joinRequestStatusSchema = selectJoinRequestSchema.shape.status
export const joinRequestPaymentStatusSchema =
  selectJoinRequestSchema.shape.paymentStatus

// ============================================================================
// Registration Settings Schemas
// ============================================================================

/**
 * Schema for creating registration settings
 */
export const createRegistrationSettingsSchema = insertRegistrationSettingsSchema
  .pick({
    societyId: true,
    isEnabled: true,
    approvalMode: true,
    formId: true,
    maxCapacity: true,
    startDate: true,
    endDate: true,
    welcomeMessage: true,
    customBanner: true,
    notificationsEnabled: true,
    isPaused: true
  })
  .extend({
    societyId: z.string().min(1, 'Society ID is required'),
    welcomeMessage: z.string().max(1000).optional(),
    maxCapacity: z.number().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional()
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate < data.endDate
      }
      return true
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate']
    }
  )

/**
 * Schema for updating registration settings
 */
export const updateRegistrationSettingsSchema =
  generatedUpdateRegistrationSettingsSchema
    .pick({
      id: true,
      isEnabled: true,
      approvalMode: true,
      formId: true,
      maxCapacity: true,
      startDate: true,
      endDate: true,
      welcomeMessage: true,
      customBanner: true,
      notificationsEnabled: true,
      isPaused: true
    })
    .extend({
      id: z.string().min(1, 'Settings ID is required'),
      welcomeMessage: z.string().max(1000).optional(),
      maxCapacity: z.number().positive().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional()
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.startDate < data.endDate
        }
        return true
      },
      {
        message: 'Start date must be before end date',
        path: ['endDate']
      }
    )

/**
 * Schema for getting registration settings by society ID
 */
export const getRegistrationSettingsSchema = z.object({
  societyId: z.string().min(1, 'Society ID is required')
})

/**
 * Full registration settings schema with society info
 */
export const fullRegistrationSettingsSchema = selectRegistrationSettingsSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    startDate: true,
    endDate: true,
    isEnabled: true,
    isPaused: true,
    notificationsEnabled: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    isEnabled: z.boolean(),
    isPaused: z.boolean(),
    notificationsEnabled: z.boolean(),
    society: z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string().nullable(),
      logo: z.string().nullable(),
      banner: z.string().nullable(),
      description: z.string().nullable(),
      primaryColor: z.string().nullable(),
      memberCount: z.number()
    }),
    form: z
      .object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        paymentEnabled: z.boolean(),
        paymentAmount: z.string().nullable()
      })
      .nullable()
  })

// ============================================================================
// Join Request Schemas
// ============================================================================

/**
 * Schema for creating a join request
 */
export const createJoinRequestSchema = insertJoinRequestSchema
  .pick({
    societyId: true,
    userId: true,
    formResponseId: true,
    paymentAmount: true
  })
  .extend({
    societyId: z.string().min(1, 'Society ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    formResponseId: z.string().min(1, 'Form response ID is required'),
    paymentAmount: z.string().optional()
  })

/**
 * Schema for listing join requests with filters
 */
export const listJoinRequestsSchema = z.object({
  societyId: z.string().min(1, 'Society ID is required'),
  status: z.array(joinRequestStatusSchema).optional(),
  paymentStatus: z.array(joinRequestPaymentStatusSchema).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  searchQuery: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

/**
 * Schema for getting a single join request
 */
export const getJoinRequestSchema = z.object({
  id: z.string().min(1, 'Join request ID is required')
})

/**
 * Schema for approving a join request
 */
export const approveJoinRequestSchema = z.object({
  id: z.string().min(1, 'Join request ID is required')
})

/**
 * Schema for rejecting a join request
 */
export const rejectJoinRequestSchema = z.object({
  id: z.string().min(1, 'Join request ID is required'),
  reason: z.string().max(500).optional()
})

/**
 * Schema for bulk approving join requests
 */
export const bulkApproveJoinRequestsSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one join request ID is required')
})

/**
 * Schema for bulk rejecting join requests
 */
export const bulkRejectJoinRequestsSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one join request ID is required'),
  reason: z.string().max(500).optional()
})

/**
 * Schema for verifying payment
 */
export const verifyPaymentSchema = z.object({
  id: z.string().min(1, 'Join request ID is required'),
  notes: z.string().max(500).optional()
})

/**
 * Schema for marking payment as not verified
 */
export const markPaymentNotVerifiedSchema = z.object({
  id: z.string().min(1, 'Join request ID is required'),
  reason: z.string().max(500, 'Reason must be less than 500 characters')
})

/**
 * Schema for uploading payment proof
 */
export const uploadPaymentProofSchema = z.object({
  id: z.string().min(1, 'Join request ID is required'),
  proofUrl: z.string().url('Invalid URL')
})

/**
 * Full join request schema with relations
 */
export const fullJoinRequestSchema = selectJoinRequestSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    submittedAt: true,
    reviewedAt: true,
    paymentVerifiedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    submittedAt: z.string(),
    reviewedAt: z.string().nullable(),
    paymentVerifiedAt: z.string().nullable(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      image: z.string().nullable(),
      phoneNumber: z.string().nullable()
    }),
    formResponse: z.object({
      id: z.string(),
      answers: z.record(z.string(), z.unknown())
    }),
    reviewer: z
      .object({
        id: z.string(),
        name: z.string()
      })
      .nullable(),
    paymentVerifier: z
      .object({
        id: z.string(),
        name: z.string()
      })
      .nullable()
  })

/**
 * Schema for getting user's join request status
 */
export const getUserJoinRequestStatusSchema = z.object({
  societyId: z.string().min(1, 'Society ID is required'),
  userId: z.string().min(1, 'User ID is required')
})

/**
 * Schema for checking registration availability
 */
export const checkRegistrationAvailabilitySchema = z.object({
  societySlug: z.string().min(1, 'Society slug is required')
})

/**
 * Schema for getting public registration page data
 */
export const getPublicRegistrationPageSchema = z.object({
  societySlug: z.string().min(1, 'Society slug is required')
})

// ============================================================================
// QR Code Schemas
// ============================================================================

/**
 * Schema for generating QR code
 */
export const generateQRCodeSchema = z.object({
  societyId: z.string().min(1, 'Society ID is required'),
  format: z.enum(['png', 'svg']).default('png'),
  size: z.number().min(100).max(1000).default(300)
})

/**
 * Schema for generating printable QR code
 */
export const generatePrintableQRCodeSchema = z.object({
  societyId: z.string().min(1, 'Society ID is required')
})

// ============================================================================
// Analytics Schemas
// ============================================================================

/**
 * Schema for getting registration analytics
 */
export const getRegistrationAnalyticsSchema = z.object({
  societyId: z.string().min(1, 'Society ID is required'),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
})

/**
 * Schema for exporting join requests
 */
export const exportJoinRequestsSchema = z.object({
  societyId: z.string().min(1, 'Society ID is required'),
  format: z.enum(['csv', 'excel']).default('csv'),
  status: z.array(joinRequestStatusSchema).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
})

// ============================================================================
// Type Exports
// ============================================================================

export type CreateRegistrationSettingsInput = z.infer<
  typeof createRegistrationSettingsSchema
>
export type UpdateRegistrationSettingsInput = z.infer<
  typeof updateRegistrationSettingsSchema
>
export type FullRegistrationSettings = z.infer<
  typeof fullRegistrationSettingsSchema
>
export type CreateJoinRequestInput = z.infer<typeof createJoinRequestSchema>
export type ListJoinRequestsInput = z.infer<typeof listJoinRequestsSchema>
export type FullJoinRequest = z.infer<typeof fullJoinRequestSchema>
export type ApproveJoinRequestInput = z.infer<typeof approveJoinRequestSchema>
export type RejectJoinRequestInput = z.infer<typeof rejectJoinRequestSchema>
export type BulkApproveJoinRequestsInput = z.infer<
  typeof bulkApproveJoinRequestsSchema
>
export type BulkRejectJoinRequestsInput = z.infer<
  typeof bulkRejectJoinRequestsSchema
>
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>
export type MarkPaymentNotVerifiedInput = z.infer<
  typeof markPaymentNotVerifiedSchema
>
