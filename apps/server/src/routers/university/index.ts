import { db } from '@api/db'
import { betterAuth } from '@api/middleware/auth'
import Elysia from 'elysia'

export const universityRouter = new Elysia({ prefix: '/university' })
  .use(betterAuth)
  .group('', { auth: true }, (app) =>
    app
      // ============================================================================
      // List Universities
      // ============================================================================
      .get(
        '/',
        async () => {
          const institutions = await db.query.institution.findMany({
            where: (institution, { eq }) => eq(institution.type, 'university')
          })

          return {
            universities: institutions.map((inst) => ({
              id: inst.id,
              name: inst.name,
              slug: inst.slug,
              logo: inst.logo,
              country: inst.country,
              city: inst.city,
              address: inst.address ?? '',
              validEmailDomains: inst.validEmailDomains
            }))
          }
        },
        {
          detail: {
            tags: ['University'],
            summary: 'Get List of Universities',
            description: 'Gets the list of universities.'
          }
        }
      )
  )
