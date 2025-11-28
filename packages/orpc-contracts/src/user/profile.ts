import { oc } from '@orpc/contract'
import { z } from 'zod'
import { profileUpdateSchema, socialLinksSchema } from './profile-schemas'

export const profile = {
  info: oc
    .route({
      method: 'GET',
      description: 'Gets the profile info for the user.',
      summary: 'Get Profile Info',
      tags: ['User']
    })
    .output(
      z.object({
        currentUniversity: z
          .object({
            id: z.string(),
            name: z.string(),
            logo: z.string().nullable(),
            slug: z.string(),
            country: z.string(),
            city: z.string()
          })
          .optional(),
        studentStatusVerified: z.boolean()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    }),

  details: oc
    .route({
      method: 'GET',
      description: 'Gets the full profile details for the user.',
      summary: 'Get Profile Details',
      tags: ['User']
    })
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        username: z.string().nullable(),
        email: z.string(),
        image: z.string().nullable(),
        bannerImage: z.string().nullable(),
        bio: z.string().nullable(),
        summary: z.string().nullable(),
        website: z.string().nullable(),
        phoneNumber: z.string().nullable(),
        phoneNumberVerified: z.boolean(),
        socialLinks: socialLinksSchema,
        currentUniversity: z
          .object({
            id: z.string(),
            name: z.string(),
            logo: z.string().nullable(),
            city: z.string(),
            country: z.string()
          })
          .nullable(),
        studentStatusVerified: z.boolean(),
        createdAt: z.date(),
        major: z.string().nullable(),
        yearOfStudy: z.string().nullable()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    }),

  update: oc
    .route({
      method: 'PATCH',
      description: 'Updates the user profile.',
      summary: 'Update Profile',
      tags: ['User']
    })
    .input(profileUpdateSchema)
    .output(
      z.object({
        success: z.boolean(),
        user: z.object({
          id: z.string(),
          name: z.string(),
          username: z.string().nullable(),
          bio: z.string().nullable(),
          summary: z.string().nullable(),
          website: z.string().nullable(),
          socialLinks: socialLinksSchema
        })
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not found')
        })
      },
      USERNAME_TAKEN: {
        data: z.object({
          message: z.string().default('Username is already taken')
        })
      },
      INVALID_INPUT: {
        data: z.object({
          message: z.string()
        })
      }
    }),

  academic: oc
    .route({
      method: 'GET',
      description: 'Gets the academic enrollments for the user.',
      summary: 'Get Academic Enrollments',
      tags: ['User']
    })
    .output(
      z.object({
        enrollments: z.array(
          z.object({
            id: z.string(),
            program: z.object({
              id: z.string(),
              name: z.string(),
              code: z.string(),
              degreeLevel: z.string()
            }),
            university: z.object({
              id: z.string(),
              name: z.string(),
              logo: z.string().nullable()
            }),
            studentStatusVerified: z.boolean(),
            startedOn: z.date().nullable(),
            graduatedOn: z.date().nullable(),
            isPrimary: z.boolean()
          })
        )
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    }),

  activity: oc
    .route({
      method: 'GET',
      description: 'Gets the activity feed for the user.',
      summary: 'Get Activity Feed',
      tags: ['User']
    })
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0)
        })
        .default({ limit: 50, offset: 0 })
    )
    .output(
      z.object({
        activities: z.array(
          z.object({
            id: z.string(),
            type: z.enum(['post', 'comment', 'join', 'event', 'achievement']),
            title: z.string(),
            description: z.string().nullable(),
            timestamp: z.date(),
            metadata: z.record(z.string(), z.any())
          })
        ),
        total: z.number(),
        hasMore: z.boolean()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    }),

  public: oc
    .route({
      method: 'GET',
      description: 'Gets the public profile for a user by username.',
      summary: 'Get Public Profile',
      tags: ['User']
    })
    .input(
      z.object({
        username: z.string().min(1)
      })
    )
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        username: z.string(),
        image: z.string().nullable(),
        bannerImage: z.string().nullable(),
        bio: z.string().nullable(),
        summary: z.string().nullable(),
        website: z.string().nullable(),
        socialLinks: socialLinksSchema,
        currentUniversity: z
          .object({
            id: z.string(),
            name: z.string(),
            logo: z.string().nullable(),
            city: z.string(),
            country: z.string()
          })
          .nullable(),
        studentStatusVerified: z.boolean(),
        createdAt: z.date(),
        major: z.string().nullable(),
        yearOfStudy: z.string().nullable()
      })
    )
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    }),

  verifyStudent: {
    listIdCards: oc
      .route({
        method: 'GET',
        description: 'List all student ID cards for the current user',
        summary: 'List Student ID Cards',
        tags: ['User']
      })
      .output(
        z.object({
          idCards: z.array(
            z.object({
              id: z.string(),
              imageUrl: z.string(),
              university: z.string().nullable(),
              studentId: z.string().nullable(),
              expiryDate: z.string().nullable(),
              createdAt: z.date(),
              isVerified: z.boolean()
            })
          )
        })
      ),

    uploadIdCard: oc
      .route({
        method: 'POST',
        description: 'Upload and parse student ID card image',
        summary: 'Upload Student ID Card',
        tags: ['User']
      })
      .input(
        z.object({
          imageBase64: z.string().describe('Base64 encoded image data')
        })
      )
      .output(
        z.object({
          id: z.string(),
          university: z.string().nullable(),
          studentId: z.string().nullable(),
          expiryDate: z.string().nullable(),
          rawText: z.array(z.string())
        })
      )
      .errors({
        INVALID_IMAGE: {
          data: z.object({
            message: z.string().default('Invalid image format')
          })
        },
        PARSING_FAILED: {
          data: z.object({
            message: z.string().default('Failed to parse student ID')
          })
        }
      }),

    deleteIdCard: oc
      .route({
        method: 'DELETE',
        description:
          'Delete a student ID card (only if not associated with verified enrollment)',
        summary: 'Delete Student ID Card',
        tags: ['User']
      })
      .input(
        z.object({
          id: z.string().min(1, 'Student ID card ID is required')
        })
      )
      .output(
        z.object({
          success: z.boolean()
        })
      )
      .errors({
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Student ID card not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default(
                'Cannot delete student ID card associated with verified enrollment'
              )
          })
        }
      }),

    sendVerificationOTP: oc
      .route({
        method: 'POST',
        description: 'Send OTP verification code to university email',
        summary: 'Send Verification OTP',
        tags: ['User']
      })
      .input(
        z.object({
          email: z.email('Invalid email address'),
          universityId: z.string().min(1, 'University ID is required'),
          studentIdCardId: z
            .string()
            .min(1, 'Student ID card ID is required')
            .describe('ID of the student ID card to use for verification')
        })
      )
      .output(
        z.object({
          success: z.boolean()
        })
      )
      .errors({
        INVALID_EMAIL_DOMAIN: {
          data: z.object({
            message: z
              .string()
              .default('Email domain does not match university')
          })
        },
        EMAIL_SEND_FAILED: {
          data: z.object({
            message: z.string().default('Failed to send verification email')
          })
        }
      }),

    verifyOTP: oc
      .route({
        method: 'POST',
        description: 'Verify OTP code and update student status',
        summary: 'Verify OTP',
        tags: ['User']
      })
      .input(
        z.object({
          otp: z
            .string()
            .length(6, 'OTP must be 6 digits')
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

    resendOTP: oc
      .route({
        method: 'POST',
        description: 'Resend verification OTP to university email',
        summary: 'Resend Verification OTP',
        tags: ['User']
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
        },
        EMAIL_SEND_FAILED: {
          data: z.object({
            message: z.string().default('Failed to send verification email')
          })
        }
      }),

    getVerificationStatus: oc
      .route({
        method: 'GET',
        description: 'Get current verification status and step',
        summary: 'Get Verification Status',
        tags: ['User']
      })
      .output(
        z.object({
          isVerified: z.boolean(),
          hasUniversityEmail: z.boolean(),
          emailVerified: z.boolean(),
          studentStatusVerified: z.boolean(),
          verificationStep: z.enum(['upload', 'email', 'otp']).nullable(),
          hasIdCard: z.boolean(),
          parsedData: z
            .object({
              university: z.string().nullable(),
              studentId: z.string().nullable()
            })
            .nullable()
        })
      )
  }
}
