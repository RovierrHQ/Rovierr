import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'

export const university = {
  list: protectedProcedure.university.list.handler(async () => {
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
  })
}
