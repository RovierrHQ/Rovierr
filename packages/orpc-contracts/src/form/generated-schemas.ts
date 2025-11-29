/**
 * Auto-generated Zod schemas from Drizzle database schemas
 *
 * DO NOT extend THIS schemas here
 *
 * These schemas are derived from the database structure using drizzle-zod.
 * For API-specific schemas, modifications, or composite schemas, use schemas.ts
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
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'

// ============================================================================
// Forms Schemas
// ============================================================================
export const insertFormSchema = createInsertSchema(forms)
export const selectFormSchema = createSelectSchema(forms)
export const updateFormSchema = createUpdateSchema(forms)

// ============================================================================
// Form Pages Schemas
// ============================================================================
export const insertFormPageSchema = createInsertSchema(formPages)
export const selectFormPageSchema = createSelectSchema(formPages)
export const updateFormPageSchema = createUpdateSchema(formPages)

// ============================================================================
// Form Questions Schemas
// ============================================================================
export const insertFormQuestionSchema = createInsertSchema(formQuestions)
export const selectFormQuestionSchema = createSelectSchema(formQuestions)
export const updateFormQuestionSchema = createUpdateSchema(formQuestions)

// ============================================================================
// Form Responses Schemas
// ============================================================================
export const insertFormResponseSchema = createInsertSchema(formResponses)
export const selectFormResponseSchema = createSelectSchema(formResponses)
export const updateFormResponseSchema = createUpdateSchema(formResponses)

// ============================================================================
// Form Progress Schemas
// ============================================================================
export const insertFormProgressSchema = createInsertSchema(formProgress)
export const selectFormProgressSchema = createSelectSchema(formProgress)
export const updateFormProgressSchema = createUpdateSchema(formProgress)

// ============================================================================
// Form Templates Schemas
// ============================================================================
export const insertFormTemplateSchema = createInsertSchema(formTemplates)
export const selectFormTemplateSchema = createSelectSchema(formTemplates)
export const updateFormTemplateSchema = createUpdateSchema(formTemplates)

// ============================================================================
// Form File Uploads Schemas
// ============================================================================
export const insertFormFileUploadSchema = createInsertSchema(formFileUploads)
export const selectFormFileUploadSchema = createSelectSchema(formFileUploads)
export const updateFormFileUploadSchema = createUpdateSchema(formFileUploads)

// ============================================================================
// Profile Field Mappings Schemas
// ============================================================================
export const insertProfileFieldMappingSchema =
  createInsertSchema(profileFieldMappings)
export const selectProfileFieldMappingSchema =
  createSelectSchema(profileFieldMappings)
export const updateProfileFieldMappingSchema =
  createUpdateSchema(profileFieldMappings)

// ============================================================================
// Profile Update Requests Schemas
// ============================================================================
export const insertProfileUpdateRequestSchema = createInsertSchema(
  profileUpdateRequests
)
export const selectProfileUpdateRequestSchema = createSelectSchema(
  profileUpdateRequests
)
export const updateProfileUpdateRequestSchema = createUpdateSchema(
  profileUpdateRequests
)
