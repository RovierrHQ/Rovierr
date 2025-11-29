/**
 * Auto-generated Zod schemas from Drizzle database schemas
 * These schemas are derived from the database structure and should be used
 * as the source of truth for API contracts
 */

import {
  formFileUploads,
  formPages,
  formProgress,
  formQuestions,
  formResponses,
  forms,
  formTemplates,
  profileFieldMappings,
  profileUpdateRequests
} from '@rov/db/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// ============================================================================
// Forms Schemas
// ============================================================================
export const insertFormSchema = createInsertSchema(forms)
export const selectFormSchema = createSelectSchema(forms)

// ============================================================================
// Form Pages Schemas
// ============================================================================
export const insertFormPageSchema = createInsertSchema(formPages)
export const selectFormPageSchema = createSelectSchema(formPages)

// ============================================================================
// Form Questions Schemas
// ============================================================================
export const insertFormQuestionSchema = createInsertSchema(formQuestions)
export const selectFormQuestionSchema = createSelectSchema(formQuestions)

// ============================================================================
// Form Responses Schemas
// ============================================================================
export const insertFormResponseSchema = createInsertSchema(formResponses)
export const selectFormResponseSchema = createSelectSchema(formResponses)

// ============================================================================
// Form Progress Schemas
// ============================================================================
export const insertFormProgressSchema = createInsertSchema(formProgress)
export const selectFormProgressSchema = createSelectSchema(formProgress)

// ============================================================================
// Form Templates Schemas
// ============================================================================
export const insertFormTemplateSchema = createInsertSchema(formTemplates)
export const selectFormTemplateSchema = createSelectSchema(formTemplates)

// ============================================================================
// Form File Uploads Schemas
// ============================================================================
export const insertFormFileUploadSchema = createInsertSchema(formFileUploads)
export const selectFormFileUploadSchema = createSelectSchema(formFileUploads)

// ============================================================================
// Profile Field Mappings Schemas
// ============================================================================
export const insertProfileFieldMappingSchema =
  createInsertSchema(profileFieldMappings)
export const selectProfileFieldMappingSchema =
  createSelectSchema(profileFieldMappings)

// ============================================================================
// Profile Update Requests Schemas
// ============================================================================
export const insertProfileUpdateRequestSchema = createInsertSchema(
  profileUpdateRequests
)
export const selectProfileUpdateRequestSchema = createSelectSchema(
  profileUpdateRequests
)

// ============================================================================
// Composite Schemas (for API responses with relations)
// ============================================================================

/**
 * Full form schema with pages and questions included
 * This is what the API returns when fetching a complete form
 *
 * Note: We override Date fields to be strings for API responses
 */
export const fullFormSchema = selectFormSchema
  .omit({
    openDate: true,
    closeDate: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    openDate: z.string().nullable(),
    closeDate: z.string().nullable(),
    publishedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    pages: z.array(
      selectFormPageSchema.omit({ createdAt: true, updatedAt: true }).extend({
        createdAt: z.string(),
        updatedAt: z.string()
      })
    ),
    questions: z.array(
      selectFormQuestionSchema
        .omit({ createdAt: true, updatedAt: true })
        .extend({
          createdAt: z.string(),
          updatedAt: z.string()
        })
    )
  })

export type FullForm = z.infer<typeof fullFormSchema>
