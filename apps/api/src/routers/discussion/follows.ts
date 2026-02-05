import { db } from '@api/lib/db'
import { betterAuth } from '@api/middleware/auth'
import { Elysia } from 'elysia'
import {
  followThreadSchema,
  listFollowedThreadsSchema,
  unfollowThreadSchema
} from './schemas'
import { FollowService } from './service'

const followService = new FollowService(db)

export const followsRouter = new Elysia({ prefix: '/follow' })
  .use(betterAuth)
  .group('', { auth: true }, (app) =>
    app
      .post(
        '/follow',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            const userId = user.id
            return await followService.followThread(body.threadId, userId)
          } catch (error) {
            if (
              error instanceof Error &&
              error.message === 'Thread not found'
            ) {
              throw new Error('Thread not found')
            }
            throw error
          }
        },
        {
          body: followThreadSchema,
          detail: {
            tags: ['Discussion'],
            summary: 'Follow Thread',
            description: 'Follow a thread to receive notifications'
          }
        }
      )
      .delete(
        '/unfollow',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            const userId = user.id
            return await followService.unfollowThread(body.threadId, userId)
          } catch (error) {
            if (
              error instanceof Error &&
              error.message === 'Thread not found'
            ) {
              throw new Error('Thread not found')
            }
            throw error
          }
        },
        {
          body: unfollowThreadSchema,
          detail: {
            tags: ['Discussion'],
            summary: 'Unfollow Thread',
            description: 'Unfollow a thread'
          }
        }
      )
      .get(
        '/list',
        async ({ query, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const userId = user.id
          return await followService.getFollowedThreads(query, userId)
        },
        {
          query: listFollowedThreadsSchema,
          detail: {
            tags: ['Discussion'],
            summary: 'List Followed Threads',
            description: 'List threads the user is following'
          }
        }
      )
  )
