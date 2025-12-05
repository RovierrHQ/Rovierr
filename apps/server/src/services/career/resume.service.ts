/**
 * Resume Service
 * Handles resume operations including optimization
 */

import type { DB } from '@rov/db'
import { resume, resumeAnalysisResult } from '@rov/db/schema'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export class ResumeService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  /**
   * Get resume by ID and verify ownership
   */
  async getResume(resumeId: string, userId: string) {
    const [result] = await this.db
      .select()
      .from(resume)
      .where(eq(resume.id, resumeId))
      .limit(1)

    if (!result) {
      return null
    }

    if (result.userId !== userId) {
      throw new Error('You do not have permission to access this resume')
    }

    return result
  }

  /**
   * Create optimized resume version with applied suggestions
   */
  async createOptimizedResume(
    sourceResumeId: string,
    jobApplicationId: string,
    selectedSuggestionIds: string[],
    title: string,
    userId: string
  ) {
    // Fetch source resume
    const sourceResume = await this.getResume(sourceResumeId, userId)

    if (!sourceResume) {
      throw new Error('Source resume not found')
    }

    const analysisResult = await this.db.query.resumeAnalysisResult.findFirst({
      where: and(
        eq(resumeAnalysisResult.resumeId, sourceResumeId),
        eq(resumeAnalysisResult.applicationId, jobApplicationId)
      )
    })

    if (!analysisResult) {
      throw new Error('Analysis results not found')
    }

    // Filter suggestions by selected IDs
    const selectedSuggestions = analysisResult.suggestions.filter((s) =>
      selectedSuggestionIds.includes(s.id)
    )

    // Apply suggestions to resume data
    const optimizedData = this.applySuggestionsToResumeData(
      sourceResume.data as Record<string, any>,
      selectedSuggestions
    )

    // Create new resume with optimized data
    const [newResume] = await this.db
      .insert(resume)
      .values({
        id: nanoid(),
        userId,
        title,
        targetPosition: sourceResume.targetPosition,
        status: 'draft',
        templateId: sourceResume.templateId,
        data: optimizedData,
        sourceResumeId,
        optimizedForJobId: jobApplicationId,
        appliedSuggestions: selectedSuggestionIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning()

    return {
      ...newResume,
      createdAt: newResume.createdAt,
      updatedAt: newResume.updatedAt
    }
  }

  /**
   * Apply suggestions to resume data
   */
  private applySuggestionsToResumeData(
    resumeData: Record<string, any>,
    suggestions: Array<{
      section: string
      itemId: string | null
      field: string
      proposedContent: string
    }>
  ): Record<string, any> {
    // Deep clone the resume data to avoid mutations
    const optimizedData = JSON.parse(JSON.stringify(resumeData))

    for (const suggestion of suggestions) {
      const { section, itemId, field, proposedContent } = suggestion

      // Handle different section types
      if (section === 'basicInfo') {
        // Direct field update for basic info
        if (optimizedData.basicInfo) {
          optimizedData.basicInfo[field] = proposedContent
        }
      } else if (itemId) {
        // Array-based sections (experience, projects, education, certifications)
        const sectionData = optimizedData[section]
        if (Array.isArray(sectionData)) {
          const item = sectionData.find((i) => i.id === itemId)
          if (item) {
            item[field] = proposedContent
          }
        }
      } else if (optimizedData[section]) {
        optimizedData[section][field] = proposedContent
      }
    }

    return optimizedData
  }
}
