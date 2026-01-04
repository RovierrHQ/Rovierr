import { db } from '@api/db'
import { NOT_FOUND } from '@api/lib/common-errors'
import { betterAuth } from '@api/middleware/auth'
import { resume } from '@rov/db/schema'
import { and, count, desc, eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'
import { nanoid } from 'nanoid'
import {
  createResumeSchema,
  listResumesSchema,
  updateResumeDataSchema,
  updateResumeMetadataSchema,
  updateResumeSectionSchema
} from './schemas'

export const resumeRouter = new Elysia({ prefix: '/resume' })
  .use(betterAuth)
  // ============================================================================
  // List Resumes
  // ============================================================================
  .get(
    '/',
    async ({ query, user }) => {
      try {
        const userId = user.id
        const { limit, offset, status } = query

        console.log('[RESUME LIST] Starting query:', {
          userId,
          limit,
          offset,
          status
        })

        // Build where clause
        const whereClause = status
          ? and(eq(resume.userId, userId), eq(resume.status, status))
          : eq(resume.userId, userId)

        // Fetch resumes (excluding data field for performance)
        const resumes = await db
          .select({
            id: resume.id,
            userId: resume.userId,
            title: resume.title,
            targetPosition: resume.targetPosition,
            status: resume.status,
            templateId: resume.templateId,
            sourceResumeId: resume.sourceResumeId,
            optimizedForJobId: resume.optimizedForJobId,
            appliedSuggestions: resume.appliedSuggestions,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt
          })
          .from(resume)
          .where(whereClause)
          .orderBy(desc(resume.updatedAt))
          .limit(limit)
          .offset(offset)

        // Get total count
        const [{ value: total }] = await db
          .select({ value: count() })
          .from(resume)
          .where(whereClause)

        const result = {
          resumes: resumes.map((r) => ({
            ...r,
            createdAt: r.createdAt || new Date().toISOString(),
            updatedAt: r.updatedAt || new Date().toISOString()
          })),
          total,
          hasMore: offset + limit < total
        }

        console.log('[RESUME LIST] Success:', {
          count: result.resumes.length,
          total: result.total
        })
        return result
      } catch (error) {
        console.error('[RESUME LIST] Error:', error)
        throw error
      }
    },
    {
      auth: true,
      query: listResumesSchema,
      detail: {
        tags: ['Resume'],
        summary: 'List Resumes',
        description: 'List all resumes for the authenticated user'
      }
    }
  )

  // ============================================================================
  // Get Resume
  // ============================================================================
  .get(
    '/:id',
    async ({ params, user }) => {
      const userId = user.id
      const { id } = params

      const [result] = await db
        .select()
        .from(resume)
        .where(and(eq(resume.id, id), eq(resume.userId, userId)))

      if (!result) {
        throw new NOT_FOUND('Resume not found')
      }

      return {
        ...result,
        createdAt: result.createdAt || new Date().toISOString(),
        updatedAt: result.updatedAt || new Date().toISOString(),
        data: result.data || {
          basicInfo: undefined,
          education: [],
          experience: [],
          projects: [],
          certifications: [],
          languages: [],
          interests: [],
          volunteer: []
        }
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String({ minLength: 1, description: 'Resume ID' })
      }),
      detail: {
        tags: ['Resume'],
        summary: 'Get Resume',
        description: 'Get a resume by ID with all data'
      }
    }
  )

  // ============================================================================
  // Create Resume
  // ============================================================================
  .post(
    '/',
    async ({ body, user }) => {
      const userId = user.id
      const { title, targetPosition, templateId } = body

      const resumeId = nanoid()

      const [newResume] = await db
        .insert(resume)
        .values({
          id: resumeId,
          userId,
          title,
          targetPosition: targetPosition || null,
          status: 'draft' as const,
          templateId: templateId || 'default',
          data: {
            education: [],
            experience: [],
            projects: [],
            certifications: [],
            languages: [],
            interests: [],
            volunteer: []
          }
        })
        .returning()

      return {
        id: newResume.id,
        title: newResume.title,
        createdAt: newResume.createdAt || new Date().toISOString()
      }
    },
    {
      auth: true,
      body: createResumeSchema,
      detail: {
        tags: ['Resume'],
        summary: 'Create Resume',
        description: 'Create a new resume'
      }
    }
  )

  // ============================================================================
  // Update Resume Metadata
  // ============================================================================
  .patch(
    '/metadata',
    async ({ body, user }) => {
      const userId = user.id
      const { id, ...updates } = body

      // Verify ownership
      const [existing] = await db
        .select({ id: resume.id })
        .from(resume)
        .where(and(eq(resume.id, id), eq(resume.userId, userId)))

      if (!existing) {
        throw new NOT_FOUND('Resume not found')
      }

      // Update metadata (updatedAt is handled by $onUpdate)
      const [updated] = await db
        .update(resume)
        .set(updates)
        .where(eq(resume.id, id))
        .returning({
          id: resume.id,
          userId: resume.userId,
          title: resume.title,
          targetPosition: resume.targetPosition,
          status: resume.status,
          templateId: resume.templateId,
          sourceResumeId: resume.sourceResumeId,
          optimizedForJobId: resume.optimizedForJobId,
          appliedSuggestions: resume.appliedSuggestions,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt
        })

      return {
        ...updated,
        createdAt: updated.createdAt || new Date().toISOString(),
        updatedAt: updated.updatedAt || new Date().toISOString()
      }
    },
    {
      auth: true,
      body: updateResumeMetadataSchema,
      detail: {
        tags: ['Resume'],
        summary: 'Update Resume Metadata',
        description: 'Update resume title, position, status, or template'
      }
    }
  )

  // ============================================================================
  // Update Resume Section
  // ============================================================================
  .patch(
    '/section',
    async ({ body, user }) => {
      const userId = user.id
      const { resumeId, section, data } = body

      // Verify ownership and get current data
      const [existing] = await db
        .select()
        .from(resume)
        .where(and(eq(resume.id, resumeId), eq(resume.userId, userId)))

      if (!existing) {
        throw new NOT_FOUND('Resume not found')
      }

      // Merge new section data with existing data
      const currentData = existing.data || {}
      const updatedData = {
        ...currentData,
        [section]: data
      }

      // Update the resume (updatedAt is handled by $onUpdate)
      const [updated] = await db
        .update(resume)
        .set({
          data: updatedData
        })
        .where(eq(resume.id, resumeId))
        .returning({
          updatedAt: resume.updatedAt
        })

      return {
        success: true,
        updatedAt: updated.updatedAt || new Date().toISOString()
      }
    },
    {
      auth: true,
      body: updateResumeSectionSchema,
      detail: {
        tags: ['Resume'],
        summary: 'Update Resume Section',
        description: 'Update a specific section of resume data'
      }
    }
  )

  // ============================================================================
  // Update Resume Data (All Sections)
  // ============================================================================
  .patch(
    '/data',
    async ({ body, user }) => {
      const userId = user.id
      const { resumeId, data } = body

      // Verify ownership
      const [existing] = await db
        .select({ id: resume.id })
        .from(resume)
        .where(and(eq(resume.id, resumeId), eq(resume.userId, userId)))

      if (!existing) {
        throw new NOT_FOUND('Resume not found')
      }

      // Update all resume data at once
      const [updated] = await db
        .update(resume)
        .set({
          // @ts-expect-error - Database type expects required basicInfo fields, but API allows partial
          data
        })
        .where(eq(resume.id, resumeId))
        .returning({
          updatedAt: resume.updatedAt
        })

      return {
        success: true,
        updatedAt: updated.updatedAt || new Date().toISOString()
      }
    },
    {
      auth: true,
      body: updateResumeDataSchema,
      detail: {
        tags: ['Resume'],
        summary: 'Update Resume Data',
        description: 'Update all resume data at once'
      }
    }
  )

  // ============================================================================
  // Delete Resume
  // ============================================================================
  .delete(
    '/:id',
    async ({ params, user }) => {
      const userId = user.id
      const { id } = params

      // Verify ownership
      const [existing] = await db
        .select({ id: resume.id })
        .from(resume)
        .where(and(eq(resume.id, id), eq(resume.userId, userId)))

      if (!existing) {
        throw new NOT_FOUND('Resume not found')
      }

      // Delete the resume
      await db.delete(resume).where(eq(resume.id, id))

      return { success: true }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String({ minLength: 1, description: 'Resume ID' })
      }),
      detail: {
        tags: ['Resume'],
        summary: 'Delete Resume',
        description: 'Delete a resume'
      }
    }
  )
