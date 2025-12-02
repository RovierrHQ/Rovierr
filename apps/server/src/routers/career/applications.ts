import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { AIService } from '@/services/career/ai.service'
import { ApplicationService } from '@/services/career/application.service'
import { URLParserService } from '@/services/career/url-parser.service'

const applicationService = new ApplicationService(db)
const urlParserService = new URLParserService()
const aiService = new AIService()

export const applications = {
  // ============================================================================
  // Create Application
  // ============================================================================

  create: protectedProcedure.career.applications.create.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await applicationService.createApplication(input, userId)
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError('VALIDATION_ERROR', {
            message: error.message
          })
        }
        throw error
      }
    }
  ),

  // ============================================================================
  // Parse URL
  // ============================================================================

  parseUrl: protectedProcedure.career.applications.parseUrl.handler(
    async ({ input }) => {
      try {
        // Fetch and extract text from URL
        const textContent = await urlParserService.fetchAndExtractText(
          input.url
        )

        // Parse job information using AI
        const parsedData = await aiService.parseJobPosting(textContent)

        return parsedData
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('Invalid URL')) {
            throw new ORPCError('INVALID_URL', {
              message: 'Invalid or inaccessible URL'
            })
          }
          if (error.message.includes('Failed to fetch')) {
            throw new ORPCError('URL_FETCH_FAILED', {
              message: error.message
            })
          }
          if (error.message.includes('AI parsing failed')) {
            throw new ORPCError('AI_PARSING_FAILED', {
              message: 'Failed to parse job information from URL'
            })
          }
        }
        throw error
      }
    }
  ),

  // ============================================================================
  // List Applications
  // ============================================================================

  list: protectedProcedure.career.applications.list.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      return await applicationService.listApplications(input, userId)
    }
  ),

  // ============================================================================
  // Get Application
  // ============================================================================

  get: protectedProcedure.career.applications.get.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await applicationService.getApplication(input.id, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Application not found') {
            throw new ORPCError('NOT_FOUND', {
              message: 'Application not found'
            })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to view this application'
            })
          }
        }
        throw error
      }
    }
  ),

  // ============================================================================
  // Update Application
  // ============================================================================

  update: protectedProcedure.career.applications.update.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await applicationService.updateApplication(input, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Application not found') {
            throw new ORPCError('NOT_FOUND', {
              message: 'Application not found'
            })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to edit this application'
            })
          }
        }
        throw error
      }
    }
  ),

  // ============================================================================
  // Delete Application
  // ============================================================================

  delete: protectedProcedure.career.applications.delete.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await applicationService.deleteApplication(input.id, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Application not found') {
            throw new ORPCError('NOT_FOUND', {
              message: 'Application not found'
            })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to delete this application'
            })
          }
        }
        throw error
      }
    }
  ),

  // ============================================================================
  // Update Status
  // ============================================================================

  updateStatus: protectedProcedure.career.applications.updateStatus.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await applicationService.updateStatus(input, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Application not found') {
            throw new ORPCError('NOT_FOUND', {
              message: 'Application not found'
            })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to edit this application'
            })
          }
        }
        throw error
      }
    }
  ),

  // ============================================================================
  // Get Statistics
  // ============================================================================

  statistics: protectedProcedure.career.applications.statistics.handler(
    async ({ context }) => {
      const userId = context.session.user.id
      return await applicationService.getStatistics(userId)
    }
  )
}
