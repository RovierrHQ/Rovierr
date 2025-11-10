import { oc } from '@orpc/contract'
import { z } from 'zod'

export const onboardingSubmitInput = z.object({
  displayName: z.string().min(1, 'Display name is required').max(50),
  profileImageUrl: z.url().nullable(),
  universityEmail: z.email('Invalid email address'),
  universityId: z.string().min(1, 'Please select a university'),
  major: z.string().nullable(),
  yearOfStudy: z.enum(['1', '2', '3', '4', 'graduate', 'phd']).nullable(),
  interests: z.array(z.string()).max(10)
})

export const onboarding = {
  submit: oc
    .route({
      method: 'POST',
      description:
        'Submit user onboarding information and send verification OTP',
      summary: 'Submit Onboarding',
      tags: ['User', 'Onboarding']
    })
    .input(onboardingSubmitInput)
    .output(
      z.object({
        success: z.boolean()
      })
    )
    .errors({
      INVALID_UNIVERSITY_DOMAIN: {
        data: z.object({
          message: z
            .string()
            .default('Email domain does not match university requirements')
        })
      },
      UNIVERSITY_EMAIL_TAKEN: {
        data: z.object({
          message: z
            .string()
            .default('This university email is already registered')
        })
      }
    }),

  verifyEmail: oc
    .route({
      method: 'POST',
      description: 'Verify university email with OTP code',
      summary: 'Verify Email OTP',
      tags: ['User', 'Onboarding']
    })
    .input(
      z.object({
        otp: z
          .string()
          .length(6)
          .regex(/^\d{6}$/, 'OTP must be 6 digits')
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        verified: z.boolean()
      })
    )
    .errors({
      TOKEN_INVALID: {
        data: z.object({
          message: z.string().default('Invalid OTP code')
        })
      },
      TOKEN_EXPIRED: {
        data: z.object({
          message: z
            .string()
            .default('OTP has expired. Please request a new one.')
        })
      }
    }),

  resendVerification: oc
    .route({
      method: 'POST',
      description: 'Resend verification OTP to university email',
      summary: 'Resend Verification OTP',
      tags: ['User', 'Onboarding']
    })
    .output(
      z.object({
        success: z.boolean()
      })
    )
    .errors({
      USER_NOT_FOUND: {
        data: z.object({
          message: z.string().default('University email not found')
        })
      }
    }),

  getStatus: oc
    .route({
      method: 'GET',
      description: 'Get user onboarding status',
      summary: 'Get Onboarding Status',
      tags: ['User', 'Onboarding']
    })
    .output(
      z.object({
        isVerified: z.boolean(),
        hasUniversityEmail: z.boolean(),
        needsOnboarding: z.boolean()
      })
    )
}
