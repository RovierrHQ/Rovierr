import { ORPCError } from '@orpc/server'
import { resumeAnalysisResult } from '@rov/db'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { AIService } from '@/services/career/ai.service'
import { CoverLetterService } from '@/services/career/cover-letter.service'
import { ResumeService } from '@/services/career/resume.service'
import { URLParserService } from '@/services/career/url-parser.service'

const aiService = new AIService()
const urlParserService = new URLParserService()
const resumeService = new ResumeService(db)
const coverLetterService = new CoverLetterService(db)

export const ai = {
  // ============================================================================
  // Parse Job Description (Text)
  // ============================================================================

  parseJobDescription: protectedProcedure.career.ai.parseJobDescription.handler(
    async ({ input }) => {
      try {
        return await aiService.parseJobDescription(input.text)
      } catch (error) {
        console.error('Parse job description error:', error)

        if (
          error instanceof Error &&
          error.message.includes('AI parsing failed')
        ) {
          throw new ORPCError('AI_PARSING_FAILED', {
            message: `Failed to parse job description: ${error.message}`
          })
        }
        throw new ORPCError('INTERNAL_ERROR', {
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred'
        })
      }
    }
  ),

  // ============================================================================
  // Parse Job URL
  // ============================================================================

  parseJobUrl: protectedProcedure.career.ai.parseJobUrl.handler(
    async ({ input }) => {
      try {
        // Fetch and extract text from URL
        const textContent = await urlParserService.fetchAndExtractText(
          input.url
        )

        // Parse job information using AI
        return await aiService.parseJobDescription(textContent)
      } catch (error) {
        console.error('Parse job URL error:', error)

        if (error instanceof Error) {
          if (error.message.includes('Invalid URL')) {
            throw new ORPCError('INVALID_URL', {
              message: `Invalid or inaccessible URL: ${error.message}`
            })
          }
          if (error.message.includes('Failed to fetch')) {
            throw new ORPCError('URL_FETCH_FAILED', {
              message: `Failed to fetch URL content: ${error.message}`
            })
          }
          if (error.message.includes('AI parsing failed')) {
            throw new ORPCError('AI_PARSING_FAILED', {
              message: `Failed to parse job information: ${error.message}`
            })
          }
        }
        throw new ORPCError('INTERNAL_ERROR', {
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred'
        })
      }
    }
  ),

  // ============================================================================
  // Analyze Resume
  // ============================================================================

  analyzeResume: protectedProcedure.career.ai.analyzeResume.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id

        // Fetch resume and verify ownership
        const resume = await resumeService.getResume(input.resumeId, userId)

        if (!resume) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Resume not found'
          })
        }

        // Check if we have a cached analysis for this resume + job combination
        const existingAnalysis = await db.query.resumeAnalysisResult.findFirst({
          where: and(
            eq(resumeAnalysisResult.resumeId, input.resumeId),
            eq(resumeAnalysisResult.applicationId, input.jobApplicationId)
          )
        })

        if (existingAnalysis) {
          // Return cached analysis
          return {
            analysis: existingAnalysis.analysis,
            suggestions: existingAnalysis.suggestions
          }
        }

        // Analyze resume against job data
        const analysis = await aiService.analyzeResume(
          resume.data as Record<string, unknown>,
          input.jobData
        )

        // Generate suggestions based on analysis
        const suggestions = await aiService.generateSuggestions(
          resume.data as Record<string, unknown>,
          input.jobData,
          analysis
        )

        // Save analysis results to database
        await db.insert(resumeAnalysisResult).values({
          userId,
          resumeId: input.resumeId,
          applicationId: input.jobApplicationId,
          analysis,
          suggestions
        })

        return {
          analysis,
          suggestions
        }
      } catch (error) {
        // Log the full error for debugging
        console.error('Resume analysis error:', error)

        if (error instanceof ORPCError) {
          throw error
        }
        if (error instanceof Error) {
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to access this resume'
            })
          }
          if (error.message.includes('analysis failed')) {
            throw new ORPCError('AI_ANALYSIS_FAILED', {
              message: `Failed to analyze resume: ${error.message}`
            })
          }
        }
        throw new ORPCError('INTERNAL_ERROR', {
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred'
        })
      }
    }
  ),

  // ============================================================================
  // Create Optimized Resume
  // ============================================================================

  createOptimizedResume:
    protectedProcedure.career.ai.createOptimizedResume.handler(
      async ({ input, context }) => {
        try {
          const userId = context.session.user.id

          // Fetch source resume and verify ownership
          const sourceResume = await resumeService.getResume(
            input.sourceResumeId,
            userId
          )

          if (!sourceResume) {
            throw new ORPCError('NOT_FOUND', {
              message: 'Source resume not found'
            })
          }

          // Create optimized resume version
          return await resumeService.createOptimizedResume(
            input.sourceResumeId,
            input.jobApplicationId,
            input.selectedSuggestions,
            input.title,
            userId
          )
        } catch (error) {
          console.error('Create optimized resume error:', error)

          if (error instanceof ORPCError) {
            throw error
          }
          if (error instanceof Error && error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to access this resume'
            })
          }
          throw new ORPCError('INTERNAL_ERROR', {
            message:
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred'
          })
        }
      }
    ),

  // ============================================================================
  // Generate Cover Letter
  // ============================================================================

  generateCoverLetter: protectedProcedure.career.ai.generateCoverLetter.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id

        // Fetch resume and verify ownership
        const resume = await resumeService.getResume(input.resumeId, userId)

        if (!resume) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Resume not found'
          })
        }

        // Generate cover letter content
        const content = await aiService.generateCoverLetter(
          resume.data as Record<string, unknown>,
          input.jobData
        )

        // Save cover letter
        return await coverLetterService.createCoverLetter(
          userId,
          input.resumeId,
          content,
          input.applicationId
        )
      } catch (error) {
        console.error('Generate cover letter error:', error)

        if (error instanceof ORPCError) {
          throw error
        }
        if (error instanceof Error) {
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to access this resume'
            })
          }
          if (error.message.includes('generation failed')) {
            throw new ORPCError('AI_GENERATION_FAILED', {
              message: `Failed to generate cover letter: ${error.message}`
            })
          }
        }
        throw new ORPCError('INTERNAL_ERROR', {
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred'
        })
      }
    }
  ),

  // ============================================================================
  // Get Cover Letter
  // ============================================================================

  getCoverLetter: protectedProcedure.career.ai.getCoverLetter.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        const coverLetter = await coverLetterService.getCoverLetter(
          input.id,
          userId
        )

        if (!coverLetter) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Cover letter not found'
          })
        }

        return coverLetter
      } catch (error) {
        console.error('Get cover letter error:', error)

        if (error instanceof ORPCError) {
          throw error
        }
        if (error instanceof Error && error.message.includes('permission')) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to access this cover letter'
          })
        }
        throw new ORPCError('INTERNAL_ERROR', {
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred'
        })
      }
    }
  ),

  // ============================================================================
  // Update Cover Letter
  // ============================================================================

  updateCoverLetter: protectedProcedure.career.ai.updateCoverLetter.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await coverLetterService.updateCoverLetter(
          input.id,
          input.content,
          userId
        )
      } catch (error) {
        console.error('Update cover letter error:', error)

        if (error instanceof ORPCError) {
          throw error
        }
        if (error instanceof Error) {
          if (error.message === 'Cover letter not found') {
            throw new ORPCError('NOT_FOUND', {
              message: 'Cover letter not found'
            })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to edit this cover letter'
            })
          }
        }
        throw new ORPCError('INTERNAL_ERROR', {
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred'
        })
      }
    }
  ),

  // ============================================================================
  // Delete Cover Letter
  // ============================================================================

  deleteCoverLetter: protectedProcedure.career.ai.deleteCoverLetter.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await coverLetterService.deleteCoverLetter(input.id, userId)
      } catch (error) {
        console.error('Delete cover letter error:', error)

        if (error instanceof ORPCError) {
          throw error
        }
        if (error instanceof Error) {
          if (error.message === 'Cover letter not found') {
            throw new ORPCError('NOT_FOUND', {
              message: 'Cover letter not found'
            })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to delete this cover letter'
            })
          }
        }
        throw new ORPCError('INTERNAL_ERROR', {
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred'
        })
      }
    }
  )
}
