import { z } from 'zod'

// Journey schemas
export const journeyStatusSchema = z.enum(['in_progress', 'completed'])

export const createJourneySchema = z.object({
  institutionId: z.string().min(1, 'Institution is required'),
  programName: z.string().min(1, 'Program name is required'),
  level: z.string().min(1, 'Level is required'),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: journeyStatusSchema.default('in_progress')
})

export const updateJourneySchema = z.object({
  id: z.string().min(1),
  institutionId: z.string().min(1).optional(),
  programName: z.string().min(1).optional(),
  level: z.string().min(1).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: journeyStatusSchema.optional()
})

// Term schemas
export const createTermSchema = z.object({
  journeyId: z.string().min(1, 'Journey is required'),
  name: z.string().min(1, 'Term name is required'),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
})

export const updateTermSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
})

// Enrollment schemas
export const courseStatusSchema = z.enum([
  'in_progress',
  'completed',
  'withdrawn'
])

export const createEnrollmentSchema = z.object({
  termId: z.string().min(1, 'Term is required'),
  courseId: z.string().min(1, 'Course is required'),
  credits: z.string().min(1, 'Credits are required'),
  grade: z.string().nullable().optional(),
  status: courseStatusSchema.default('in_progress')
})

export const updateEnrollmentSchema = z.object({
  id: z.string().min(1),
  credits: z.string().min(1).optional(),
  grade: z.string().nullable().optional(),
  status: courseStatusSchema.optional()
})

// Achievement schemas
export const achievementTypeSchema = z.enum([
  'award',
  'competition',
  'scholarship',
  'certificate'
])

export const createAchievementSchema = z.object({
  journeyId: z.string().min(1, 'Journey is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  dateAwarded: z.string().min(1, 'Date awarded is required'),
  type: achievementTypeSchema
})

export const updateAchievementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  dateAwarded: z.string().optional(),
  type: achievementTypeSchema.optional()
})

// Output schemas
export const journeySchema = z.object({
  id: z.string(),
  userId: z.string(),
  institutionId: z.string(),
  programName: z.string(),
  level: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  status: journeyStatusSchema,
  cumulativeGpa: z.string().nullable(),
  totalCredits: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  institution: z.object({
    id: z.string(),
    name: z.string(),
    logo: z.string().nullable(),
    type: z.string(),
    country: z.string(),
    city: z.string()
  })
})

export const termSchema = z.object({
  id: z.string(),
  journeyId: z.string(),
  name: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  gpa: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const enrollmentSchema = z.object({
  id: z.string(),
  termId: z.string(),
  courseId: z.string(),
  credits: z.string(),
  grade: z.string().nullable(),
  gradePoints: z.string().nullable(),
  status: courseStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  course: z.object({
    id: z.string(),
    code: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    defaultCredits: z.string().nullable(),
    department: z.string().nullable()
  })
})

export const achievementSchema = z.object({
  id: z.string(),
  journeyId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  dateAwarded: z.string(),
  type: achievementTypeSchema,
  createdAt: z.date(),
  updatedAt: z.date()
})

// Timeline schema
export const timelineSchema = z.object({
  journeys: z.array(
    journeySchema.extend({
      terms: z.array(
        termSchema.extend({
          enrollments: z.array(enrollmentSchema)
        })
      ),
      achievements: z.array(achievementSchema)
    })
  )
})
