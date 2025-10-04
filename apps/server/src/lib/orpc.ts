import { OpenAPIGenerator } from '@orpc/openapi'
import { implement, ORPCError } from '@orpc/server'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { appContract } from '@rov/orpc-contracts'
import type { Context } from './context'

const os = implement(appContract)
export const o = os.$context<Context>()

export const publicProcedure = o

const requireAuth = o.middleware(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError('UNAUTHORIZED')
  }
  return next({
    context: {
      session: context.session
    }
  })
})

export const protectedProcedure = publicProcedure.use(requireAuth)

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()]
})

export const openAPISpec = await openAPIGenerator.generate(appContract, {
  info: {
    title: 'rov API',
    version: '0.0.1'
  }
})
