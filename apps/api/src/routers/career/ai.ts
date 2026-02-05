/**
 * Career AI Router
 *
 * Handles AI-powered career features including resume analysis,
 * optimization, and cover letter generation
 */

import { FORBIDDEN, NOT_FOUND } from '@api/lib/common-errors'
import { db } from '@api/lib/db'
import { betterAuth } from '@api/middleware/auth'
import { resumeAnalysisResult } from '@rov/db'
import { and, eq } from 'drizzle-orm'
import { Elysia } from 'elysia'
import type { z } from 'zod'
import {
  AIAnalysisFailedError,
  AIGenerationFailedError,
  AIParsingFailedError,
  InvalidUrlError,
  UrlFetchFailedError
} from './errors'
import {
  analyzeResumeResponseSchema,
  analyzeResumeSchema,
  coverLetterSchema,
  createOptimizedResumeSchema,
  deleteResponseSchema,
  extendedParsedJobDataSchema,
  generateCoverLetterSchema,
  parseJobDescriptionSchema,
  parseJobUrlSchema,
  resumeSchema,
  updateCoverLetterSchema
} from './schemas'
import { AIService } from './service/ai.service'
import { CoverLetterService } from './service/cover-letter.service'
import { ResumeService } from './service/resume.service'
import { URLParserService } from './service/url-parser.service'

const aiService = new AIService()
const urlParserService = new URLParserService()
const resumeService = new ResumeService(db)
const coverLetterService = new CoverLetterService(db)

export const aiRouter = new Elysia({ prefix: '/ai' })
  .use(betterAuth)
  .group('', { auth: true, detail: { tags: ['Career', 'AI'] } }, (app) =>
    app
      // POST /ai/parse-job-description - Parse job description
      .post(
        '/parse-job-description',
        async ({ body }) => {
          try {
            return await aiService.parseJobDescription(body.text)
          } catch (error) {
            console.error('Parse job description error:', error)

            if (
              error instanceof Error &&
              error.message.includes('AI parsing failed')
            ) {
              throw new AIParsingFailedError(
                `Failed to parse job description: ${error.message}`
              )
            }
            throw error
          }
        },
        {
          body: parseJobDescriptionSchema,
          response: extendedParsedJobDataSchema,
          detail: {
            description: 'Parse job description from text using AI',
            summary: 'Parse Job Description'
          }
        }
      )

      // POST /ai/parse-job-url - Parse job URL
      .post(
        '/parse-job-url',
        async ({ body }) => {
          try {
            // Fetch and extract text from URL
            const textContent = await urlParserService.fetchAndExtractText(
              body.url
            )

            // Parse job information using AI
            return await aiService.parseJobDescription(textContent)
          } catch (error) {
            console.error('Parse job URL error:', error)

            if (error instanceof Error) {
              if (error.message.includes('Invalid URL')) {
                throw new InvalidUrlError(
                  `Invalid or inaccessible URL: ${error.message}`
                )
              }
              if (error.message.includes('Failed to fetch')) {
                throw new UrlFetchFailedError(
                  `Failed to fetch URL content: ${error.message}`
                )
              }
              if (error.message.includes('AI parsing failed')) {
                throw new AIParsingFailedError(
                  `Failed to parse job information: ${error.message}`
                )
              }
            }
            throw error
          }
        },
        {
          body: parseJobUrlSchema,
          response: extendedParsedJobDataSchema,
          detail: {
            description: 'Parse job description from URL using AI',
            summary: 'Parse Job URL'
          }
        }
      )

      // POST /ai/analyze-resume - Analyze resume
      .post(
        '/analyze-resume',
        async ({ body, user }) => {
          try {
            const userId = user.id

            // Fetch resume and verify ownership
            const resume = await resumeService.getResume(body.resumeId, userId)

            if (!resume) {
              throw new NOT_FOUND('Resume not found')
            }

            // Check if we have a cached analysis for this resume + job combination
            const existingAnalysis =
              await db.query.resumeAnalysisResult.findFirst({
                where: and(
                  eq(resumeAnalysisResult.resumeId, body.resumeId),
                  eq(resumeAnalysisResult.applicationId, body.jobApplicationId)
                )
              })

            if (existingAnalysis) {
              // Return cached analysis
              return {
                analysis: existingAnalysis.analysis,
                suggestions: existingAnalysis.suggestions
              } as z.infer<typeof analyzeResumeResponseSchema>
            }

            // Analyze resume against job data
            const analysis = await aiService.analyzeResume(
              resume.data as Record<string, unknown>,
              body.jobData
            )

            // Generate suggestions based on analysis
            const suggestions = await aiService.generateSuggestions(
              resume.data as Record<string, unknown>,
              body.jobData,
              analysis
            )

            // Save analysis results to database
            await db.insert(resumeAnalysisResult).values({
              userId,
              resumeId: body.resumeId,
              applicationId: body.jobApplicationId,
              analysis,
              suggestions
            })

            return {
              analysis,
              suggestions
            } as z.infer<typeof analyzeResumeResponseSchema>
          } catch (error) {
            console.error('Resume analysis error:', error)

            if (error instanceof NOT_FOUND) {
              throw error
            }
            if (error instanceof Error) {
              if (error.message.includes('permission')) {
                throw new FORBIDDEN(
                  'You do not have permission to access this resume'
                )
              }
              if (error.message.includes('analysis failed')) {
                throw new AIAnalysisFailedError(
                  `Failed to analyze resume: ${error.message}`
                )
              }
            }
            throw error
          }
        },
        {
          body: analyzeResumeSchema,
          response: analyzeResumeResponseSchema,
          detail: {
            description: 'Analyze resume against job description using AI',
            summary: 'Analyze Resume'
          }
        }
      )

      // POST /ai/create-optimized-resume - Create optimized resume
      .post(
        '/create-optimized-resume',
        async ({ body, user }) => {
          try {
            const userId = user.id

            // Fetch source resume and verify ownership
            const sourceResume = await resumeService.getResume(
              body.sourceResumeId,
              userId
            )

            if (!sourceResume) {
              throw new NOT_FOUND('Source resume not found')
            }

            // Create optimized resume version
            return await resumeService.createOptimizedResume(
              body.sourceResumeId,
              body.jobApplicationId,
              body.selectedSuggestions,
              body.title,
              userId
            )
          } catch (error) {
            console.error('Create optimized resume error:', error)

            if (error instanceof NOT_FOUND) {
              throw error
            }
            if (
              error instanceof Error &&
              error.message.includes('permission')
            ) {
              throw new FORBIDDEN(
                'You do not have permission to access this resume'
              )
            }
            throw error
          }
        },
        {
          body: createOptimizedResumeSchema,
          response: resumeSchema,
          detail: {
            description:
              'Create optimized resume version with applied suggestions',
            summary: 'Create Optimized Resume'
          }
        }
      )

      // POST /ai/generate-cover-letter - Generate cover letter
      .post(
        '/generate-cover-letter',
        async ({ body, user }) => {
          try {
            const userId = user.id

            // Fetch resume and verify ownership
            const resume = await resumeService.getResume(body.resumeId, userId)

            if (!resume) {
              throw new NOT_FOUND('Resume not found')
            }

            // Generate cover letter content
            const content = await aiService.generateCoverLetter(
              resume.data as Record<string, unknown>,
              body.jobData
            )

            // Save cover letter
            return await coverLetterService.createCoverLetter(
              userId,
              body.resumeId,
              content,
              body.applicationId
            )
          } catch (error) {
            console.error('Generate cover letter error:', error)

            if (error instanceof NOT_FOUND) {
              throw error
            }
            if (error instanceof Error) {
              if (error.message.includes('permission')) {
                throw new FORBIDDEN(
                  'You do not have permission to access this resume'
                )
              }
              if (error.message.includes('generation failed')) {
                throw new AIGenerationFailedError(
                  `Failed to generate cover letter: ${error.message}`
                )
              }
            }
            throw error
          }
        },
        {
          body: generateCoverLetterSchema,
          response: coverLetterSchema,
          detail: {
            description: 'Generate cover letter using AI',
            summary: 'Generate Cover Letter'
          }
        }
      )

      // GET /ai/cover-letter/:id - Get cover letter
      .get(
        '/cover-letter/:id',
        async ({ params, user }) => {
          try {
            const userId = user.id
            const coverLetter = await coverLetterService.getCoverLetter(
              params.id,
              userId
            )

            if (!coverLetter) {
              throw new NOT_FOUND('Cover letter not found')
            }

            return coverLetter
          } catch (error) {
            console.error('Get cover letter error:', error)

            if (error instanceof NOT_FOUND) {
              throw error
            }
            if (
              error instanceof Error &&
              error.message.includes('permission')
            ) {
              throw new FORBIDDEN(
                'You do not have permission to access this cover letter'
              )
            }
            throw error
          }
        },
        {
          response: coverLetterSchema,
          detail: {
            description: 'Get cover letter by ID',
            summary: 'Get Cover Letter'
          }
        }
      )

      // PATCH /ai/cover-letter/:id - Update cover letter
      .patch(
        '/cover-letter/:id',
        async ({ params, body, user }) => {
          try {
            const userId = user.id
            return await coverLetterService.updateCoverLetter(
              params.id,
              body.content,
              userId
            )
          } catch (error) {
            console.error('Update cover letter error:', error)

            if (error instanceof Error) {
              if (error.message === 'Cover letter not found') {
                throw new NOT_FOUND('Cover letter not found')
              }
              if (error.message.includes('permission')) {
                throw new FORBIDDEN(
                  'You do not have permission to edit this cover letter'
                )
              }
            }
            throw error
          }
        },
        {
          body: updateCoverLetterSchema.omit({ id: true }),
          response: coverLetterSchema,
          detail: {
            description: 'Update cover letter content',
            summary: 'Update Cover Letter'
          }
        }
      )

      // DELETE /ai/cover-letter/:id - Delete cover letter
      .delete(
        '/cover-letter/:id',
        async ({ params, user }) => {
          try {
            const userId = user.id
            return await coverLetterService.deleteCoverLetter(params.id, userId)
          } catch (error) {
            console.error('Delete cover letter error:', error)

            if (error instanceof Error) {
              if (error.message === 'Cover letter not found') {
                throw new NOT_FOUND('Cover letter not found')
              }
              if (error.message.includes('permission')) {
                throw new FORBIDDEN(
                  'You do not have permission to delete this cover letter'
                )
              }
            }
            throw error
          }
        },
        {
          response: deleteResponseSchema,
          detail: {
            description: 'Delete cover letter',
            summary: 'Delete Cover Letter'
          }
        }
      )
  )
