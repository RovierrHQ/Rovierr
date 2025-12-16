/**
 * Career Router
 *
 * Handles job application management and AI-powered career features including
 * resume analysis, optimization, and cover letter generation.
 */

import { db } from '@api/db'
import { FORBIDDEN, NOT_FOUND } from '@api/lib/common-errors'
import { betterAuth } from '@api/middleware/auth'
import { AIService } from '@api/services/career/ai.service'
import { ApplicationService } from '@api/services/career/application.service'
import { CoverLetterService } from '@api/services/career/cover-letter.service'
import { ResumeService } from '@api/services/career/resume.service'
import { URLParserService } from '@api/services/career/url-parser.service'
import { resumeAnalysisResult } from '@rov/db'
import { and, eq } from 'drizzle-orm'
import { Elysia } from 'elysia'
import { z } from 'zod'
import {
  AIAnalysisFailedError,
  AIGenerationFailedError,
  AIParsingFailedError,
  InvalidUrlError,
  UrlFetchFailedError,
  ValidationError
} from './errors'
import {
  analyzeResumeResponseSchema,
  analyzeResumeSchema,
  applicationSchema,
  applicationsListSchema,
  coverLetterSchema,
  createApplicationSchema,
  createOptimizedResumeSchema,
  deleteResponseSchema,
  extendedParsedJobDataSchema,
  generateCoverLetterSchema,
  listApplicationsSchema,
  parsedJobDataSchema,
  parseJobDescriptionSchema,
  parseJobUrlSchema,
  resumeSchema,
  statisticsSchema,
  updateApplicationSchema,
  updateCoverLetterSchema,
  updateStatusSchema
} from './schemas'

// Initialize services
const applicationService = new ApplicationService(db)
const urlParserService = new URLParserService()
const aiService = new AIService()
const resumeService = new ResumeService(db)
const coverLetterService = new CoverLetterService(db)

export const careerRouter = new Elysia({ prefix: '/career' })
  .use(betterAuth)
  .group('', { auth: true }, (app) =>
    app
      // ========================================================================
      // Applications Endpoints
      // ========================================================================

      // POST /career/applications - Create application
      .post(
        '/applications',
        async ({ body, user }) => {
          try {
            const userId = user.id
            return await applicationService.createApplication(body, userId)
          } catch (error) {
            if (error instanceof Error) {
              throw new ValidationError(error.message)
            }
            throw error
          }
        },
        {
          body: createApplicationSchema,
          response: applicationSchema,
          detail: {
            description: 'Create a new job application',
            summary: 'Create Application',
            tags: ['Career']
          }
        }
      )

      // POST /career/applications/parse-url - Parse job URL
      .post(
        '/applications/parse-url',
        async ({ body }) => {
          try {
            // Fetch and extract text from URL
            const textContent = await urlParserService.fetchAndExtractText(
              body.url
            )

            // Parse job information using AI
            const parsedData = await aiService.parseJobPosting(textContent)

            return parsedData
          } catch (error) {
            if (error instanceof Error) {
              if (error.message.includes('Invalid URL')) {
                throw new InvalidUrlError()
              }
              if (error.message.includes('Failed to fetch')) {
                throw new UrlFetchFailedError(error.message)
              }
              if (error.message.includes('AI parsing failed')) {
                throw new AIParsingFailedError()
              }
            }
            throw error
          }
        },
        {
          body: z.object({ url: z.string().url('Invalid URL') }),
          response: parsedJobDataSchema,
          detail: {
            description: 'Parse job post URL and extract information using AI',
            summary: 'Parse Job URL',
            tags: ['Career']
          }
        }
      )

      // GET /career/applications - List applications
      .get(
        '/applications',
        async ({ query, user }) => {
          const userId = user.id
          return await applicationService.listApplications(query, userId)
        },
        {
          query: listApplicationsSchema,
          response: applicationsListSchema,
          detail: {
            description: 'List job applications with filters',
            summary: 'List Applications',
            tags: ['Career']
          }
        }
      )

      // GET /career/applications/:id - Get application
      .get(
        '/applications/:id',
        async ({ params, user }) => {
          try {
            const userId = user.id
            return await applicationService.getApplication(params.id, userId)
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'Application not found') {
                throw new NOT_FOUND('Application not found')
              }
              if (error.message.includes('permission')) {
                throw new FORBIDDEN(
                  'You do not have permission to view this application'
                )
              }
            }
            throw error
          }
        },
        {
          response: applicationSchema,
          detail: {
            description: 'Get a single job application by ID',
            summary: 'Get Application',
            tags: ['Career']
          }
        }
      )

      // PATCH /career/applications/:id - Update application
      .patch(
        '/applications/:id',
        async ({ params, body, user }) => {
          try {
            const userId = user.id
            return await applicationService.updateApplication(
              { ...body, id: params.id },
              userId
            )
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'Application not found') {
                throw new NOT_FOUND('Application not found')
              }
              if (error.message.includes('permission')) {
                throw new FORBIDDEN(
                  'You do not have permission to edit this application'
                )
              }
            }
            throw error
          }
        },
        {
          body: updateApplicationSchema.omit({ id: true }),
          response: applicationSchema,
          detail: {
            description: 'Update a job application',
            summary: 'Update Application',
            tags: ['Career']
          }
        }
      )

      // DELETE /career/applications/:id - Delete application
      .delete(
        '/applications/:id',
        async ({ params, user }) => {
          try {
            const userId = user.id
            return await applicationService.deleteApplication(params.id, userId)
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'Application not found') {
                throw new NOT_FOUND('Application not found')
              }
              if (error.message.includes('permission')) {
                throw new FORBIDDEN(
                  'You do not have permission to delete this application'
                )
              }
            }
            throw error
          }
        },
        {
          response: deleteResponseSchema,
          detail: {
            description: 'Delete a job application',
            summary: 'Delete Application',
            tags: ['Career']
          }
        }
      )

      // PATCH /career/applications/:id/status - Update status
      .patch(
        '/applications/:id/status',
        async ({ params, body, user }) => {
          try {
            const userId = user.id
            return await applicationService.updateStatus(
              { id: params.id, status: body.status },
              userId
            )
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'Application not found') {
                throw new NOT_FOUND('Application not found')
              }
              if (error.message.includes('permission')) {
                throw new FORBIDDEN(
                  'You do not have permission to edit this application'
                )
              }
            }
            throw error
          }
        },
        {
          body: updateStatusSchema.omit({ id: true }),
          response: applicationSchema,
          detail: {
            description: 'Update application status',
            summary: 'Update Status',
            tags: ['Career']
          }
        }
      )

      // GET /career/applications/statistics - Get statistics
      .get(
        '/applications/statistics',
        async ({ user }) => {
          const userId = user.id
          return await applicationService.getStatistics(userId)
        },
        {
          response: statisticsSchema,
          detail: {
            description: 'Get application statistics for the current user',
            summary: 'Get Statistics',
            tags: ['Career']
          }
        }
      )

      // ========================================================================
      // AI Assistant Endpoints
      // ========================================================================

      // POST /career/ai/parse-job-description - Parse job description
      .post(
        '/ai/parse-job-description',
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
            summary: 'Parse Job Description',
            tags: ['Career', 'AI']
          }
        }
      )

      // POST /career/ai/parse-job-url - Parse job URL
      .post(
        '/ai/parse-job-url',
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
            summary: 'Parse Job URL',
            tags: ['Career', 'AI']
          }
        }
      )

      // POST /career/ai/analyze-resume - Analyze resume
      .post(
        '/ai/analyze-resume',
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
              }
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
            }
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
            summary: 'Analyze Resume',
            tags: ['Career', 'AI']
          }
        }
      )

      // POST /career/ai/create-optimized-resume - Create optimized resume
      .post(
        '/ai/create-optimized-resume',
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
            summary: 'Create Optimized Resume',
            tags: ['Career', 'AI']
          }
        }
      )

      // POST /career/ai/generate-cover-letter - Generate cover letter
      .post(
        '/ai/generate-cover-letter',
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
            summary: 'Generate Cover Letter',
            tags: ['Career', 'AI']
          }
        }
      )

      // GET /career/ai/cover-letter/:id - Get cover letter
      .get(
        '/ai/cover-letter/:id',
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
            summary: 'Get Cover Letter',
            tags: ['Career', 'AI']
          }
        }
      )

      // PATCH /career/ai/cover-letter/:id - Update cover letter
      .patch(
        '/ai/cover-letter/:id',
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
            summary: 'Update Cover Letter',
            tags: ['Career', 'AI']
          }
        }
      )

      // DELETE /career/ai/cover-letter/:id - Delete cover letter
      .delete(
        '/ai/cover-letter/:id',
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
            summary: 'Delete Cover Letter',
            tags: ['Career', 'AI']
          }
        }
      )
  )
