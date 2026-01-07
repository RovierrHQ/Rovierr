import { db } from '@api/db'
import { betterAuth } from '@api/middleware/auth'
import { ReplyService } from '@api/services/discussion/reply.service'
import { ThreadService } from '@api/services/discussion/thread.service'
import { Elysia } from 'elysia'
import {
  createThreadSchema,
  listThreadsSchema,
  lockThreadSchema,
  pinThreadSchema,
  updateThreadSchema
} from './schemas'

const replyService = new ReplyService(db)
const threadService = new ThreadService(db)

export const threadsRouter = new Elysia({ prefix: '/thread' })
  .use(betterAuth)
  .guard({ auth: true })

  // ============================================================================
  // Thread CRUD Operations
  // ============================================================================
  .post(
    '/create',
    async ({ body, user }) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const userId = user.id
        return await threadService.createThread(body, userId)
      } catch (error) {
        if (error instanceof Error &&
          error.message.includes('permission')) {
          throw new Error(error.message)
        }
        throw error
      }
    },
    {

      body: createThreadSchema,
      detail: {
        tags: ['Discussion'],
        summary: 'Create Thread',
        description: 'Create a new discussion thread'
      }
    }
  )
  .get(
    '/list',
    async ({ query, user }) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const userId = user.id
        return await threadService.listThreads(query, userId)
      } catch (error) {
        if (error instanceof Error &&
          error.message.includes('permission')) {
          throw new Error(error.message)
        }
        throw error
      }
    },
    {

      query: listThreadsSchema,
      detail: {
        tags: ['Discussion'],
        summary: 'List Threads',
        description: 'List discussion threads with filters'
      }
    }
  )
  .get(
    '/:id',
    async ({ params, user }) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const userId = user.id
        const thread = await threadService.getThreadById(params.id, userId)

        // Fetch replies for the thread
        const replies = await replyService.getRepliesForThread(
          params.id,
          userId
        )

        return {
          ...thread,
          replies
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new Error('Thread not found')
          }
          if (error.message.includes('permission')) {
            throw new Error(error.message)
          }
        }
        throw error
      }
    },
    {

      detail: {
        tags: ['Discussion'],
        summary: 'Get Thread',
        description: 'Get a single thread with replies'
      }
    }
  )
  .patch(
    '/update',
    async ({ body, user }) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const userId = user.id
        // TODO: Check if user is moderator for the context
        const isModerator = false
        return await threadService.updateThread(body, userId, isModerator)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new Error('Thread not found')
          }
          if (error.message.includes('permission')) {
            throw new Error(error.message)
          }
        }
        throw error
      }
    },
    {
      body: updateThreadSchema,
      detail: {
        tags: ['Discussion'],
        summary: 'Update Thread',
        description: 'Update a thread'
      }
    }
  )
  .delete(
    '/:id',
    async ({ params, user }) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const userId = user.id
        // TODO: Check if user is moderator for the context
        const isModerator = false
        return await threadService.deleteThread(params.id, userId, isModerator)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new Error('Thread not found')
          }
          if (error.message.includes('permission')) {
            throw new Error(error.message)
          }
        }
        throw error
      }
    },
    {
      detail: {
        tags: ['Discussion'],
        summary: 'Delete Thread',
        description: 'Delete a thread'
      }
    }
  )
  // ============================================================================
  // Moderator Actions
  // ============================================================================
  .patch(
    '/pin',
    async ({ body, user }) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const userId = user.id
        // TODO: Check if user is moderator for the context
        return await threadService.pinThread(body, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new Error('Thread not found')
          }
          throw new Error(
            'User does not have moderator permission to pin threads'
          )
        }
        throw error
      }
    },
    {

      body: pinThreadSchema,
      detail: {
        tags: ['Discussion'],
        summary: 'Pin Thread',
        description: 'Pin or unpin a thread'
      }
    }
  )
  .patch(
    '/lock',
    async ({ body, user }) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const userId = user.id
        // TODO: Check if user is moderator for the context
        return await threadService.lockThread(body, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new Error('Thread not found')
          }
          throw new Error(
            'User does not have moderator permission to lock threads'
          )
        }
        throw error
      }
    },
    {

      body: lockThreadSchema,
      detail: {
        tags: ['Discussion'],
        summary: 'Lock Thread',
        description: 'Lock or unlock a thread'
      }
    }
  )