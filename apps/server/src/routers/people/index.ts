import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { PeopleService } from '@/services/people'

const peopleService = new PeopleService(db)

export const people = {
  list: protectedProcedure.people.list.handler(async ({ input, context }) => {
    try {
      return await peopleService.listUsers(context.session.user.id, input)
    } catch (error) {
      if (error instanceof Error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: error.message
        })
      }
      throw error
    }
  }),

  search: protectedProcedure.people.search.handler(
    async ({ input, context }) => {
      try {
        return await peopleService.searchUsers(context.session.user.id, input)
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: error.message
          })
        }
        throw error
      }
    }
  )
}
