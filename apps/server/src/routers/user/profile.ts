import { ORPCError } from '@orpc/server'
import {
  program as programTable,
  university as universityTable,
  userProgramEnrollment as userProgramEnrollmentTable,
  user as userTable
} from '@rov/db'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'

export const profile = {
  info: protectedProcedure.user.profile.info.handler(async ({ context }) => {
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
        studentStatusVerified: userProgramEnrollmentTable.studentStatusVerified
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
  }),

  details: protectedProcedure.user.profile.details.handler(
    async ({ context }) => {
      // Get user data
      const user = await db.query.user.findFirst({
        where: eq(userTable.id, context.session.user.id),
        columns: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
          bio: true,
          website: true,
          phoneNumber: true,
          phoneNumberVerified: true,
          whatsapp: true,
          telegram: true,
          instagram: true,
          facebook: true,
          twitter: true,
          linkedin: true,
          createdAt: true
        }
      })

      if (!user) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'User not found'
        })
      }

      // Get university info
      const [enrollmentData] = await db
        .select({
          currentUniversity: {
            id: universityTable.id,
            name: universityTable.name,
            logo: universityTable.logo,
            city: universityTable.city,
            country: universityTable.country
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

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        bio: user.bio,
        website: user.website,
        phoneNumber: user.phoneNumber,
        phoneNumberVerified: user.phoneNumberVerified ?? false,
        socialLinks: {
          whatsapp: user.whatsapp,
          telegram: user.telegram,
          instagram: user.instagram,
          facebook: user.facebook,
          twitter: user.twitter,
          linkedin: user.linkedin
        },
        currentUniversity: enrollmentData?.currentUniversity ?? null,
        studentStatusVerified: Boolean(
          enrollmentData?.studentStatusVerified ?? false
        ),
        createdAt: new Date(user.createdAt)
      }
    }
  ),

  update: protectedProcedure.user.profile.update.handler(
    async ({ input, context }) => {
      // Check if username is taken (if username is being updated)
      if (input.username) {
        const existingUser = await db.query.user.findFirst({
          where: and(
            eq(userTable.username, input.username),
            // Exclude current user
            eq(userTable.id, context.session.user.id)
          )
        })

        // If found and it's not the current user, username is taken
        if (existingUser && existingUser.id !== context.session.user.id) {
          throw new ORPCError('USERNAME_TAKEN', {
            message: 'Username is already taken'
          })
        }
      }

      // Validate URLs if provided
      if (input.website && input.website !== '') {
        try {
          new URL(input.website)
        } catch {
          throw new ORPCError('INVALID_INPUT', {
            message: 'Invalid website URL'
          })
        }
      }

      // Update user profile
      const updateData: Record<string, string | null> = {}

      if (input.name !== undefined) updateData.name = input.name
      if (input.username !== undefined) updateData.username = input.username
      if (input.bio !== undefined) updateData.bio = input.bio || null
      if (input.website !== undefined)
        updateData.website = input.website || null
      if (input.whatsapp !== undefined)
        updateData.whatsapp = input.whatsapp || null
      if (input.telegram !== undefined)
        updateData.telegram = input.telegram || null
      if (input.instagram !== undefined)
        updateData.instagram = input.instagram || null
      if (input.facebook !== undefined)
        updateData.facebook = input.facebook || null
      if (input.twitter !== undefined)
        updateData.twitter = input.twitter || null
      if (input.linkedin !== undefined)
        updateData.linkedin = input.linkedin || null

      await db
        .update(userTable)
        .set(updateData)
        .where(eq(userTable.id, context.session.user.id))

      // Fetch updated user data
      const updatedUser = await db.query.user.findFirst({
        where: eq(userTable.id, context.session.user.id),
        columns: {
          id: true,
          name: true,
          username: true,
          bio: true,
          website: true,
          whatsapp: true,
          telegram: true,
          instagram: true,
          facebook: true,
          twitter: true,
          linkedin: true
        }
      })

      if (!updatedUser) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'User not found'
        })
      }

      return {
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          username: updatedUser.username,
          bio: updatedUser.bio,
          website: updatedUser.website,
          socialLinks: {
            whatsapp: updatedUser.whatsapp,
            telegram: updatedUser.telegram,
            instagram: updatedUser.instagram,
            facebook: updatedUser.facebook,
            twitter: updatedUser.twitter,
            linkedin: updatedUser.linkedin
          }
        }
      }
    }
  ),

  academic: protectedProcedure.user.profile.academic.handler(
    async ({ context }) => {
      const enrollments = await db
        .select({
          id: userProgramEnrollmentTable.id,
          program: {
            id: programTable.id,
            name: programTable.name,
            code: programTable.code,
            degreeLevel: programTable.degreeLevel
          },
          university: {
            id: universityTable.id,
            name: universityTable.name,
            logo: universityTable.logo
          },
          studentStatusVerified:
            userProgramEnrollmentTable.studentStatusVerified,
          startedOn: userProgramEnrollmentTable.startedOn,
          graduatedOn: userProgramEnrollmentTable.graduatedOn,
          isPrimary: userProgramEnrollmentTable.isPrimary
        })
        .from(userProgramEnrollmentTable)
        .innerJoin(
          programTable,
          eq(programTable.id, userProgramEnrollmentTable.programId)
        )
        .innerJoin(
          universityTable,
          eq(universityTable.id, programTable.universityId)
        )
        .where(eq(userProgramEnrollmentTable.userId, context.session.user.id))

      return {
        enrollments: enrollments.map((enrollment) => ({
          id: enrollment.id,
          program: {
            id: enrollment.program.id,
            name: enrollment.program.name,
            code: enrollment.program.code,
            degreeLevel: enrollment.program.degreeLevel
          },
          university: {
            id: enrollment.university.id,
            name: enrollment.university.name,
            logo: enrollment.university.logo
          },
          studentStatusVerified: Boolean(enrollment.studentStatusVerified),
          startedOn: enrollment.startedOn
            ? new Date(enrollment.startedOn)
            : null,
          graduatedOn: enrollment.graduatedOn
            ? new Date(enrollment.graduatedOn)
            : null,
          isPrimary: Boolean(enrollment.isPrimary)
        }))
      }
    }
  ),

  activity: protectedProcedure.user.profile.activity.handler(({ input }) => {
    // TODO: Implement activity feed when activity tracking is added
    // For now, return empty array as placeholder
    const limit = input.limit ?? 50
    const offset = input.offset ?? 0

    // Placeholder implementation
    const activities: Array<{
      id: string
      type: 'post' | 'comment' | 'join' | 'event' | 'achievement'
      title: string
      description: string | null
      timestamp: Date
      metadata: Record<string, unknown>
    }> = []
    const total = 0

    return {
      activities,
      total,
      hasMore: offset + limit < total
    }
  })
}
