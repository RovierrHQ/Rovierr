/**
 * Career Applications Router
 *
 * Handles job application management endpoints
 */

import { FORBIDDEN, NOT_FOUND } from '@api/lib/common-errors'
import { db } from '@api/lib/db'
import { betterAuth } from '@api/middleware/auth'
import { Elysia } from 'elysia'
import { z } from 'zod'
import {
  AIParsingFailedError,
  InvalidUrlError,
  UrlFetchFailedError,
  ValidationError
} from './errors'
import {
  applicationSchema,
  applicationsListSchema,
  createApplicationSchema,
  deleteResponseSchema,
  listApplicationsSchema,
  parsedJobDataSchema,
  statisticsSchema,
  updateApplicationSchema,
  updateStatusSchema
} from './schemas'
import { AIService } from './service/ai.service'
import { ApplicationService } from './service/application.service'
import { URLParserService } from './service/url-parser.service'

const applicationService = new ApplicationService(db)
const urlParserService = new URLParserService()
const aiService = new AIService()

export const applicationsRouter = new Elysia({ prefix: '/applications' })
  .use(betterAuth)
  .group('', { auth: true }, (app) =>
    app
      // POST /applications - Create application
      .post(
        '/',
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

      // POST /applications/parse-url - Parse job URL
      .post(
        '/parse-url',
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

      // GET /applications - List applications
      .get(
        '/',
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

      // GET /applications/:id - Get application
      .get(
        '/:id',
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

      // PATCH /applications/:id - Update application
      .patch(
        '/:id',
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

      // DELETE /applications/:id - Delete application
      .delete(
        '/:id',
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

      // PATCH /applications/:id/status - Update status
      .patch(
        '/:id/status',
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

      // GET /applications/statistics - Get statistics
      .get(
        '/statistics',
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
  )
