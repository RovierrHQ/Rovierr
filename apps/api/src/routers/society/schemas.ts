/**
 * Society Router Schemas
 *
 * This file contains all Zod schemas for the society router.
 * Schemas are generated from Drizzle database schemas using drizzle-zod.
 */

import { organization } from '@rov/db'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// ============================================================================
// Generated Schemas from Database
// ============================================================================

export const insertOrganizationSchema = createInsertSchema(organization)
export const selectOrganizationSchema = createSelectSchema(organization)

// ============================================================================
// Enum Schemas - Extracted from generated schemas
// ============================================================================

export const organizationTypeSchema = selectOrganizationSchema.shape.type
export const visibilitySchema = selectOrganizationSchema.shape.visibility

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Schema for updating society-specific fields
 * Excludes core org fields like name/slug which are handled by Better-Auth
 */
export const updateSocietyFieldsSchema = z.object({
  description: z.string().min(1).max(1000).optional(),
  institutionId: z.string().optional(),
  type: organizationTypeSchema.optional(),
  visibility: visibilitySchema.optional(),
  tags: z.array(z.string()).optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),

  // Social links
  instagram: z
    .string()
    .regex(/^@?[\w.]+$/, 'Invalid Instagram username format')
    .optional()
    .or(z.literal('')),
  facebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  twitter: z
    .string()
    .regex(/^@?[\w]+$/, 'Invalid Twitter username format')
    .optional()
    .or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  telegram: z.string().optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),

  // Additional details
  foundingYear: z
    .number()
    .int()
    .min(1800, 'Founding year must be after 1800')
    .max(new Date().getFullYear(), 'Founding year cannot be in the future')
    .optional(),
  meetingSchedule: z
    .string()
    .max(200, 'Meeting schedule must be less than 200 characters')
    .optional(),
  membershipRequirements: z
    .string()
    .max(500, 'Membership requirements must be less than 500 characters')
    .optional(),
  goals: z
    .string()
    .max(1000, 'Goals must be less than 1000 characters')
    .optional(),

  // Branding
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Primary color must be a valid hex color')
    .optional()
})

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Society output schema (enriched organization + society fields)
 */
export const societySchema = selectOrganizationSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    metadata: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    metadata: z.record(z.string(), z.any()).nullable(),
    institutionName: z.string().nullable(),
    memberCount: z.number()
  })

// ============================================================================
// Type Exports
// ============================================================================

export type UpdateSocietyFieldsInput = z.infer<typeof updateSocietyFieldsSchema>
export type Society = z.infer<typeof societySchema>
