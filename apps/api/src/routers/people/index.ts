import { db } from '@api/lib/db'
import { betterAuth } from '@api/middleware/auth'
import Elysia from 'elysia'
import { listUsersSchema, searchUsersSchema } from './schemas'
import { PeopleService } from './service'

const peopleService = new PeopleService(db)

export const people = new Elysia({ name: 'people' }).use(betterAuth).group(
  '/people',
  {
    auth: true
  },
  (app) =>
    app
      .get(
        '/list',
        async ({ query, user }) => {
          return await peopleService.listUsers(user.id, query)
        },
        {
          query: listUsersSchema
        }
      )
      .get(
        '/search',
        async ({ query, user }) => {
          return await peopleService.searchUsers(user.id, query)
        },
        {
          query: searchUsersSchema
        }
      )
)
