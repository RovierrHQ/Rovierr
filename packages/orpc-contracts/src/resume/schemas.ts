/**
 * Consolidated Resume Schemas
 *
 * This file uses Drizzle-generated schemas as the source of truth and extends them
 * for API-specific use cases.
 */

import { z } from 'zod'
import { selectResumeSchema } from './generated-schemas'

// Re-export generated schemas
export {
  insertResumeSchema,
  selectResumeSchema,
  updateResumeSchema
} from './generated-schemas'

// ============================================================================
// Enum Schemas - Extracted from generated schemas
// ============================================================================

export const resumeStatusSchema = selectResumeSchema.shape.status
export const languageProficiencySchema = z.enum([
  'basic',
  'conversational',
  'fluent',
  'native'
])

// ============================================================================
// Section Schemas
// ============================================================================

export const basicInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  location: z.string().min(1, 'Location is required'),
  summary: z.string().max(500).optional()
})

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  gpa: z.string().min(1).max(4).optional(),
  gpaScale: z.string().min(1).max(4).optional()
})

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().min(1, 'Description is required')
})

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z.array(z.string()),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  url: z.url('Invalid URL').optional().or(z.literal('')),
  order: z.number()
})

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expirationDate: z.string().optional()
})

export const languageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Language name is required'),
  proficiency: languageProficiencySchema
})

export const volunteerSchema = z.object({
  id: z.string(),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Role is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().min(1, 'Description is required')
})

export const resumeDataSchema = z.object({
  basicInfo: basicInfoSchema.optional(),
  education: z.array(educationSchema).default([]),
  experience: z.array(experienceSchema).default([]),
  projects: z.array(projectSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  languages: z.array(languageSchema).default([]),
  interests: z.array(z.string()).default([]),
  volunteer: z.array(volunteerSchema).default([])
})

// ============================================================================
// Composite Schemas (for API responses with full data)
// ============================================================================

export const fullResumeSchema = selectResumeSchema
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    data: resumeDataSchema
  })

// ============================================================================
// Input Schemas - Built from generated schemas
// ============================================================================

export const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  targetPosition: z.string().max(100).optional(),
  templateId: z.string().default('default')
})

export const updateResumeMetadataSchema = z.object({
  id: z.string().min(1, 'Resume ID is required'),
  title: z.string().min(1, 'Title is required').max(200).optional(),
  targetPosition: z.string().max(100).optional(),
  status: resumeStatusSchema.optional(),
  templateId: z.string().optional()
})

export const updateResumeSectionSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  section: z.enum([
    'basicInfo',
    'education',
    'experience',
    'projects',
    'certifications',
    'languages',
    'interests',
    'volunteer'
  ]),
  data: z.any() // Will be validated based on section type
})

// ============================================================================
// Query Schemas
// ============================================================================

export const listResumesSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  status: resumeStatusSchema.optional()
})

// ============================================================================
// Type Exports
// ============================================================================

export type BasicInfo = z.infer<typeof basicInfoSchema>
export type Education = z.infer<typeof educationSchema>
export type Experience = z.infer<typeof experienceSchema>
export type Project = z.infer<typeof projectSchema>
export type Certification = z.infer<typeof certificationSchema>
export type Language = z.infer<typeof languageSchema>
export type Volunteer = z.infer<typeof volunteerSchema>
export type ResumeData = z.infer<typeof resumeDataSchema>
export type FullResume = z.infer<typeof fullResumeSchema>
export type CreateResumeInput = z.infer<typeof createResumeSchema>
export type UpdateResumeMetadataInput = z.infer<
  typeof updateResumeMetadataSchema
>
export type UpdateResumeSectionInput = z.infer<typeof updateResumeSectionSchema>
export type ListResumesQuery = z.infer<typeof listResumesSchema>
