import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  emailDetailsSchema,
  listEmailsResponseSchema,
  listEmailsSchema,
  previewEmailResponseSchema,
  previewEmailSchema,
  sendEmailResponseSchema,
  sendEmailSchema
} from './schemas'

export const societyEmail = {
  send: oc
    .route({
      method: 'POST',
      description: 'Send mass email to all society members',
      summary: 'Send Society Email',
      tags: ['Society Email']
    })
    .input(sendEmailSchema)
    .output(sendEmailResponseSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Only society presidents can send emails')
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string(),
          errors: z.record(z.string(), z.string()).optional()
        })
      },
      NO_RECIPIENTS: {
        data: z.object({
          message: z.string().default('No active members to send email to')
        })
      },
      SEND_FAILED: {
        data: z.object({
          message: z.string().default('Failed to send email')
        })
      }
    }),

  preview: oc
    .route({
      method: 'POST',
      description: 'Preview email with sample data',
      summary: 'Preview Email',
      tags: ['Society Email']
    })
    .input(previewEmailSchema)
    .output(previewEmailResponseSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('Only society presidents can preview emails')
        })
      }
    }),

  list: oc
    .route({
      method: 'GET',
      description: 'List sent emails for a society',
      summary: 'List Society Emails',
      tags: ['Society Email']
    })
    .input(listEmailsSchema)
    .output(listEmailsResponseSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('Only society presidents can view email history')
        })
      }
    }),

  get: oc
    .route({
      method: 'GET',
      description: 'Get email details with delivery status',
      summary: 'Get Email Details',
      tags: ['Society Email']
    })
    .input(z.object({ emailId: z.string().min(1, 'Email ID is required') }))
    .output(emailDetailsSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('Only society presidents can view email details')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Email not found')
        })
      }
    })
}

export * from './schemas'
