import { eq } from 'drizzle-orm'
import { db } from '@/db'
import {
  program as programTable,
  userProgramEnrollment as userProgramEnrollmentTable
} from '@/db/schema/program'
import { university as universityTable } from '@/db/schema/university'
import { protectedProcedure } from '@/lib/orpc'

export const user = {
  profileInfo: protectedProcedure.user.profileInfo.handler(
    async ({ context }) => {
      const [userData] = await db
        .select({
          currentUniversity: {
            id: universityTable.id,
            name: universityTable.name,
            logo: universityTable.logo,
            slug: universityTable.slug,
            country: universityTable.country,
            city: universityTable.city
          },
          studentStatusVerified:
            userProgramEnrollmentTable.studentStatusVerified
        })
        .from(userProgramEnrollmentTable)
        .leftJoin(
          programTable,
          eq(programTable.id, userProgramEnrollmentTable.programId)
        )
        .leftJoin(
          universityTable,
          eq(universityTable.id, programTable.universityId)
        )
        .where(eq(userProgramEnrollmentTable.userId, context.session.user.id))
        .limit(1)

      if (!userData?.currentUniversity?.id) {
        return {
          studentStatusVerified: false
        }
      }

      return {
        currentUniversity: userData.currentUniversity,
        studentStatusVerified: Boolean(userData.studentStatusVerified)
      }
    }
  )
}
