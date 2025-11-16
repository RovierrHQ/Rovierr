import { ORPCError } from '@orpc/server'
import { organization as organizationTable } from '@rov/db'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { protectedProcedure } from '@/lib/orpc'

export const studentOrganizations = {
  create: protectedProcedure.studentOrganizations.create.handler(
    async ({ input, context }) => {
      // 1. Check if user is verified
      if (!context.session.user.isVerified) {
        throw new ORPCError('USER_NOT_VERIFIED', {
          message: 'Only verified users can create organizations'
        })
      }

      try {
        // 2. Create organization using better-auth
        // Generate slug from name
        const slug = input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

        const organizationResult = await auth.api.createOrganization({
          body: {
            name: input.name,
            slug
          }
        })

        const organizationId = organizationResult?.id ?? ''

        if (!organizationId) {
          throw new ORPCError('ORGANIZATION_CREATION_FAILED', {
            message: 'Failed to create organization'
          })
        }

        // 3. Update organization with additional fields
        await db
          .update(organizationTable)
          .set({
            description: input.description,
            tags: input.tags
          })
          .where(eq(organizationTable.id, organizationId))

        return {
          organizationId,
          success: true
        }
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }

        throw new ORPCError('ORGANIZATION_CREATION_FAILED', {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to create organization'
        })
      }
    }
  )
}
