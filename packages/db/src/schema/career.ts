import {
  type AnyPgColumn,
  jsonb,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

/**
 * ========================
 *  JOB APPLICATIONS
 * ========================
 */
export const jobApplication = pgTable('job_application', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Job details
  companyName: text('company_name').notNull(),
  positionTitle: text('position_title').notNull(),
  jobPostUrl: text('job_post_url'),
  location: text('location'),
  salaryRange: text('salary_range'),

  // Application tracking
  status: text('status', {
    enum: [
      'applied',
      'interview_scheduled',
      'interview_completed',
      'offer_received',
      'rejected',
      'withdrawn'
    ]
  })
    .notNull()
    .default('applied'),

  applicationDate: timestamp('application_date', {
    withTimezone: true,
    mode: 'string'
  })
    .notNull()
    .defaultNow(),
  notes: text('notes'),

  // AI-parsed job data
  parsedJobData: jsonb('parsed_job_data').$type<{
    description: string
    requirements: string[]
    responsibilities: string[]
    skills: string[]
    experienceYears: number | null
    educationLevel: string | null
  } | null>(),

  ...timestamps
})

/**
 * ========================
 *  RESUMES
 * ========================
 */
export const resume = pgTable('resume', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Resume metadata
  title: text('title').notNull(),
  targetPosition: text('target_position'),
  status: text('status', { enum: ['draft', 'published'] })
    .notNull()
    .default('draft'),
  templateId: text('template_id').notNull().default('default'),

  // AI optimization metadata
  sourceResumeId: text('source_resume_id').references(
    (): AnyPgColumn => resume.id,
    {
      onDelete: 'set null'
    }
  ),
  optimizedForJobId: text('optimized_for_job_id').references(
    () => jobApplication.id,
    { onDelete: 'set null' }
  ),
  appliedSuggestions: jsonb('applied_suggestions')
    .$type<string[]>()
    .default([]),

  // Resume data stored as JSONB (all sections in one field)
  // Can selectively exclude this column in queries for performance
  data: jsonb('data')
    .$type<{
      basicInfo?: {
        name: string
        email: string
        phone: string
        location: string
        summary?: string
      }
      education?: Array<{
        id: string
        institution: string
        degree: string
        fieldOfStudy: string
        startDate: string
        endDate?: string
        current: boolean
        gpa?: string
        gpaScale?: string
      }>
      experience?: Array<{
        id: string
        company: string
        position: string
        location: string
        startDate: string
        endDate?: string
        current: boolean
        description: string
      }>
      projects?: Array<{
        id: string
        name: string
        description: string
        technologies: string[]
        startDate?: string
        endDate?: string
        url?: string
        order: number
      }>
      certifications?: Array<{
        id: string
        name: string
        issuer: string
        issueDate: string
        expirationDate?: string
      }>
      languages?: Array<{
        id: string
        name: string
        proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
      }>
      interests?: string[]
      volunteer?: Array<{
        id: string
        organization: string
        role: string
        startDate: string
        endDate?: string
        current: boolean
        description: string
      }>
    }>()
    .default({}),

  ...timestamps
})

/**
 * ========================
 *  COVER LETTERS
 * ========================
 */
export const coverLetter = pgTable('cover_letter', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  applicationId: text('application_id').references(() => jobApplication.id, {
    onDelete: 'set null'
  }),
  resumeId: text('resume_id')
    .notNull()
    .references(() => resume.id, { onDelete: 'cascade' }),

  // Cover letter content
  content: text('content').notNull(),

  ...timestamps
})

/**
 * ========================
 *  RESUME ANALYSIS RESULTS
 * ========================
 */
export const resumeAnalysisResult = pgTable('resume_analysis_result', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  resumeId: text('resume_id')
    .notNull()
    .references(() => resume.id, { onDelete: 'cascade' }),
  applicationId: text('application_id')
    .notNull()
    .references(() => jobApplication.id, { onDelete: 'cascade' }),

  // Analysis results
  analysis: jsonb('analysis').notNull().$type<{
    matchScore: number
    strengths: string[]
    gaps: string[]
    keywordMatches: {
      found: string[]
      missing: string[]
    }
    sectionScores: Record<
      string,
      {
        score: number
        feedback: string
      }
    >
    overallFeedback: string
  }>(),

  // Suggestions
  suggestions: jsonb('suggestions').notNull().$type<
    Array<{
      id: string
      section: string
      itemId: string | null
      field: string
      originalContent: string
      proposedContent: string
      reasoning: string
      impactScore: number
      keywords: string[]
    }>
  >(),

  ...timestamps
})
