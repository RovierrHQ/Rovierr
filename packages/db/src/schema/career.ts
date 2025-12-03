import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
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
