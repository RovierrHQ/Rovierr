/**
 * Society Email Schemas
 *
 * This file uses Drizzle-generated schemas as the source of truth and extends them
 * for API-specific use cases.
 */

import { z } from 'zod'
import { selectSocietyEmailSchema } from './generated-schemas'

// ============================================================================
// Enum Schemas - Extracted from generated schemas
// ============================================================================

export const emailStatusSchema = selectSocietyEmailSchema.shape.status

// ============================================================================
// Input Schemas - Built from generated schemas
// ============================================================================

/**
 * Schema for sending a society email
 */
export const sendEmailSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be 200 characters or less'),
  bodyHtml: z.string().min(1, 'Email body is required'),
  bodyText: z.string().min(1, 'Email body is required')
})

/**
 * Schema for previewing an email
 */
export const previewEmailSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  subject: z.string(),
  bodyHtml: z.string()
})

/**
 * Schema for listing society emails
 */
export const listEmailsSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Response schema for sending an email
 */
export const sendEmailResponseSchema = z.object({
  emailId: z.string(),
  recipientCount: z.number(),
  status: emailStatusSchema
})

/**
 * Response schema for email preview
 */
export const previewEmailResponseSchema = z.object({
  previewHtml: z.string(),
  previewSubject: z.string(),
  sampleData: z.object({
    user: z.object({
      name: z.string(),
      email: z.string(),
      username: z.string().nullable()
    }),
    organization: z.object({
      name: z.string()
    })
  })
})

/**
 * Email history item schema
 */
export const emailHistoryItemSchema = selectSocietyEmailSchema
  .pick({
    id: true,
    subject: true,
    recipientCount: true,
    successCount: true,
    failureCount: true,
    status: true,
    sentAt: true
  })
  .extend({
    sender: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable()
    })
  })

/**
 * Response schema for listing emails
 */
export const listEmailsResponseSchema = z.object({
  emails: z.array(emailHistoryItemSchema),
  total: z.number(),
  hasMore: z.boolean()
})

/**
 * Response schema for email details
 */
export const emailDetailsSchema = selectSocietyEmailSchema.extend({
  sender: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable()
  }),
  organization: z.object({
    id: z.string(),
    name: z.string()
  })
})

// ============================================================================
// Type Exports
// ============================================================================

export type SendEmailInput = z.infer<typeof sendEmailSchema>
export type PreviewEmailInput = z.infer<typeof previewEmailSchema>
export type ListEmailsInput = z.infer<typeof listEmailsSchema>
export type SendEmailResponse = z.infer<typeof sendEmailResponseSchema>
export type PreviewEmailResponse = z.infer<typeof previewEmailResponseSchema>
export type EmailHistoryItem = z.infer<typeof emailHistoryItemSchema>
export type ListEmailsResponse = z.infer<typeof listEmailsResponseSchema>
export type EmailDetails = z.infer<typeof emailDetailsSchema>
