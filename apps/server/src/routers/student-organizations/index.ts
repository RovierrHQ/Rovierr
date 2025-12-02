import { ORPCError } from '@orpc/server'
import {
  instituitionEnrollment as institutionEnrollmentTable,
  member as memberTable,
  organization as organizationTable
} from '@rov/db'
import { and, count, desc, eq, inArray, or, sql } from 'drizzle-orm'
import { db } from '@/db'
import { publicProcedure } from '@/lib/orpc'

export const studentOrganizations = {
  // Note: Organization creation is handled by Better-Auth authClient.organization.create()
  // on the frontend, so no create handler is needed here

  listAllOrganizations:
    publicProcedure.studentOrganizations.listAllOrganizations.handler(
      async ({ input, context }) => {
        try {
          let { page, limit } = input.query ?? {}

          page = Number(page) || 1
          limit = Number(limit) || 20

          const offset = (page - 1) * limit

          // Get user's institutionId if authenticated
          let userInstitutionId: string | null = null
          if (context.session?.user?.id) {
            const enrollment = await db.query.instituitionEnrollment.findFirst({
              where: eq(
                institutionEnrollmentTable.userId,
                context.session.user.id
              ),
              columns: { institutionId: true }
            })

            userInstitutionId = enrollment?.institutionId ?? null
          }

          // Build visibility filter
          // Include: public organizations, and campus_only if user's institution matches
          const visibilityConditions = userInstitutionId
            ? or(
                eq(organizationTable.visibility, 'public'),
                and(
                  eq(organizationTable.visibility, 'campus_only'),
                  eq(organizationTable.institutionId, userInstitutionId)
                )
              )
            : eq(organizationTable.visibility, 'public')

          // Get total count
          const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(organizationTable)
            .where(visibilityConditions)

          const total = Number(countResult?.count ?? 0)

          // Get organizations with institution info and verification status
          const organizations = await db
            .select({
              id: organizationTable.id,
              name: organizationTable.name,
              slug: organizationTable.slug,
              description: organizationTable.description,
              tags: organizationTable.tags,
              type: organizationTable.type,
              visibility: organizationTable.visibility,
              institutionId: organizationTable.institutionId,
              isVerified: organizationTable.isVerified
            })
            .from(organizationTable)
            .where(visibilityConditions)
            .orderBy(desc(organizationTable.createdAt))
            .limit(limit)
            .offset(offset)

          // Get member counts for all organizations in a batch
          const organizationIds = organizations.map((org) => org.id)
          const memberCountResults =
            organizationIds.length > 0
              ? await db
                  .select({
                    organizationId: memberTable.organizationId,
                    count: count()
                  })
                  .from(memberTable)
                  .where(inArray(memberTable.organizationId, organizationIds))
                  .groupBy(memberTable.organizationId)
              : []

          const memberCountMap = new Map(
            memberCountResults.map((mc) => [mc.organizationId, mc.count])
          )

          // Get institution names for organizations that have institutionId
          const institutionIds = organizations
            .map((org) => org.institutionId)
            .filter((id): id is string => id !== null)
          const institutions =
            institutionIds.length > 0
              ? await db.query.institution.findMany({
                  where: (inst) => inArray(inst.id, institutionIds),
                  columns: { id: true, name: true }
                })
              : []

          const institutionMap = new Map(
            institutions.map((inst) => [inst.id, inst.name])
          )

          return {
            data: organizations.map((org) => ({
              id: org.id,
              name: org.name,
              slug: org.slug,
              description: org.description,
              tags: org.tags,
              type: org.type as 'student' | 'university',
              visibility: org.visibility as
                | 'public'
                | 'campus_only'
                | 'private',
              institutionId: org.institutionId,
              institutionName: org.institutionId
                ? (institutionMap.get(org.institutionId) ?? null)
                : null,
              isVerified: org.isVerified ?? false,
              memberCount: memberCountMap.get(org.id) ?? 0
            })),
            meta: {
              page,
              limit,
              total,
              totalPage: Math.ceil(total / limit)
            }
          }
        } catch (error) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to list organizations'
          })
        }
      }
    )
}
