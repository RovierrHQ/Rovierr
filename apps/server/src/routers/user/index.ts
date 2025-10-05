import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { user as userTable } from '@/db/schema/auth'
import {
  universityMember as universityMemberTable,
  university as universityTable
} from '@/db/schema/university'
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
            slug: universityTable.slug
          },
          studentStatusVerified: universityMemberTable.studentStatusVerified
        })
        .from(userTable)
        .leftJoin(
          universityMemberTable,
          eq(userTable.id, universityMemberTable.userId)
        )
        .leftJoin(
          universityTable,
          eq(universityMemberTable.universityId, universityTable.id)
        )
        .where(eq(userTable.id, context.session.user.id))
        .limit(1)

      if (!userData?.currentUniversity?.id) {
        return {
          studentStatusVerified: false
        }
      }

      return {
        currentUniversity: {
          id: userData.currentUniversity.id,
          name: userData.currentUniversity.name,
          slug: userData.currentUniversity.slug,
          logo: userData.currentUniversity.logo
        },
        studentStatusVerified: userData.studentStatusVerified ?? false
      }
    }
  )
}
