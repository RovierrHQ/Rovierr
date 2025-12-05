import { ORPCError } from '@orpc/server'
import { resume } from '@rov/db/schema'
import { and, count, desc, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'

export const resumeRouter = {
  // ============================================================================
  // List Resumes
  // ============================================================================

  list: protectedProcedure.resume.list.handler(async ({ input, context }) => {
    try {
      const userId = context.session.user.id
      const { limit, offset, status } = input

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
  }),

  // ============================================================================
  // Get Resume
  // ============================================================================

  get: protectedProcedure.resume.get.handler(async ({ input, context }) => {
    const userId = context.session.user.id
    const { id } = input

    const [result] = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, userId)))

    if (!result) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Resume not found'
      })
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
  }),

  // ============================================================================
  // Create Resume
  // ============================================================================

  create: protectedProcedure.resume.create.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { title, targetPosition, templateId } = input

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
            basicInfo: undefined,
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
    }
  ),

  // ============================================================================
  // Update Resume Metadata
  // ============================================================================

  updateMetadata: protectedProcedure.resume.updateMetadata.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { id, ...updates } = input

      // Verify ownership
      const [existing] = await db
        .select({ id: resume.id })
        .from(resume)
        .where(and(eq(resume.id, id), eq(resume.userId, userId)))

      if (!existing) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Resume not found'
        })
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
    }
  ),

  // ============================================================================
  // Update Resume Section
  // ============================================================================

  updateSection: protectedProcedure.resume.updateSection.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { resumeId, section, data } = input

      // Verify ownership and get current data
      const [existing] = await db
        .select()
        .from(resume)
        .where(and(eq(resume.id, resumeId), eq(resume.userId, userId)))

      if (!existing) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Resume not found'
        })
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
    }
  ),

  // ============================================================================
  // Update Resume Data (All Sections)
  // ============================================================================

  updateData: protectedProcedure.resume.updateData.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { resumeId, data } = input

      // Verify ownership
      const [existing] = await db
        .select({ id: resume.id })
        .from(resume)
        .where(and(eq(resume.id, resumeId), eq(resume.userId, userId)))

      if (!existing) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Resume not found'
        })
      }

      // Update all resume data at once
      const [updated] = await db
        .update(resume)
        .set({
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
    }
  ),

  // ============================================================================
  // Delete Resume
  // ============================================================================

  delete: protectedProcedure.resume.delete.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { id } = input

      // Verify ownership
      const [existing] = await db
        .select({ id: resume.id })
        .from(resume)
        .where(and(eq(resume.id, id), eq(resume.userId, userId)))

      if (!existing) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Resume not found'
        })
      }

      // Delete the resume
      await db.delete(resume).where(eq(resume.id, id))

      return { success: true }
    }
  )
}
