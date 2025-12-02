import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  approveJoinRequestSchema,
  bulkApproveJoinRequestsSchema,
  bulkRejectJoinRequestsSchema,
  checkRegistrationAvailabilitySchema,
  createJoinRequestSchema,
  createRegistrationSettingsSchema,
  exportJoinRequestsSchema,
  fullJoinRequestSchema,
  fullRegistrationSettingsSchema,
  generatePrintableQRCodeSchema,
  generateQRCodeSchema,
  getJoinRequestSchema,
  getPublicRegistrationPageSchema,
  getRegistrationAnalyticsSchema,
  getRegistrationSettingsSchema,
  getUserJoinRequestStatusSchema,
  joinRequestPaymentStatusSchema,
  joinRequestStatusSchema,
  listJoinRequestsSchema,
  markPaymentNotVerifiedSchema,
  rejectJoinRequestSchema,
  simpleRequestToJoinSchema,
  updateRegistrationSettingsSchema,
  uploadPaymentProofSchema,
  verifyPaymentSchema
} from './schemas'

export const societyRegistration = {
  // ============================================================================
  // Registration Settings Management
  // ============================================================================
  settings: {
    get: oc
      .route({
        method: 'GET',
        description: 'Get registration settings for a society',
        summary: 'Get Registration Settings',
        tags: ['Society Registration']
      })
      .input(getRegistrationSettingsSchema)
      .output(fullRegistrationSettingsSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Registration settings not found')
          })
        }
      }),

    create: oc
      .route({
        method: 'POST',
        description: 'Create registration settings for a society',
        summary: 'Create Registration Settings',
        tags: ['Society Registration']
      })
      .input(createRegistrationSettingsSchema)
      .output(
        z.object({
          id: z.string(),
          societyId: z.string()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default(
                'You do not have permission to configure registration settings'
              )
          })
        },
        ALREADY_EXISTS: {
          data: z.object({
            message: z
              .string()
              .default('Registration settings already exist for this society')
          })
        }
      }),

    update: oc
      .route({
        method: 'PATCH',
        description: 'Update registration settings',
        summary: 'Update Registration Settings',
        tags: ['Society Registration']
      })
      .input(updateRegistrationSettingsSchema)
      .output(
        z.object({
          success: z.boolean()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default(
                'You do not have permission to update registration settings'
              )
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Registration settings not found')
          })
        }
      })
  },

  // ============================================================================
  // Join Request Management
  // ============================================================================
  joinRequest: {
    create: oc
      .route({
        method: 'POST',
        description: 'Create a join request',
        summary: 'Create Join Request',
        tags: ['Society Registration']
      })
      .input(createJoinRequestSchema)
      .output(
        z.object({
          id: z.string(),
          status: joinRequestStatusSchema,
          requiresPayment: z.boolean()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        REGISTRATION_CLOSED: {
          data: z.object({
            message: z.string().default('Registration is currently closed')
          })
        },
        REGISTRATION_FULL: {
          data: z.object({
            message: z.string().default('Registration has reached capacity')
          })
        },
        ALREADY_MEMBER: {
          data: z.object({
            message: z
              .string()
              .default('You are already a member of this society')
          })
        },
        DUPLICATE_REQUEST: {
          data: z.object({
            message: z
              .string()
              .default('You already have a pending join request')
          })
        }
      }),

    simpleRequestToJoin: oc
      .route({
        method: 'POST',
        description:
          'Create a simple join request without forms (always enabled)',
        summary: 'Simple Request to Join',
        tags: ['Society Registration']
      })
      .input(simpleRequestToJoinSchema)
      .output(
        z.object({
          id: z.string(),
          status: joinRequestStatusSchema,
          requiresPayment: z.boolean()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        ALREADY_MEMBER: {
          data: z.object({
            message: z
              .string()
              .default('You are already a member of this society')
          })
        },
        DUPLICATE_REQUEST: {
          data: z.object({
            message: z
              .string()
              .default('You already have a pending join request')
          })
        }
      }),

    list: oc
      .route({
        method: 'GET',
        description: 'List join requests for a society',
        summary: 'List Join Requests',
        tags: ['Society Registration']
      })
      .input(listJoinRequestsSchema)
      .output(
        z.object({
          requests: z.array(
            z.object({
              id: z.string(),
              userId: z.string(),
              userName: z.string(),
              userEmail: z.string(),
              userImage: z.string().nullable(),
              status: joinRequestStatusSchema,
              paymentStatus: joinRequestPaymentStatusSchema,
              paymentAmount: z.string().nullable(),
              submittedAt: z.string(),
              reviewedAt: z.string().nullable()
            })
          ),
          total: z.number(),
          hasMore: z.boolean()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to view join requests')
          })
        }
      }),

    get: oc
      .route({
        method: 'GET',
        description: 'Get a single join request',
        summary: 'Get Join Request',
        tags: ['Society Registration']
      })
      .input(getJoinRequestSchema)
      .output(fullJoinRequestSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Join request not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to view this join request')
          })
        }
      }),

    approve: oc
      .route({
        method: 'POST',
        description: 'Approve a join request',
        summary: 'Approve Join Request',
        tags: ['Society Registration']
      })
      .input(approveJoinRequestSchema)
      .output(
        z.object({
          success: z.boolean(),
          memberId: z.string()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to approve join requests')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Join request not found')
          })
        },
        INVALID_STATUS: {
          data: z.object({
            message: z
              .string()
              .default('Join request cannot be approved in its current status')
          })
        }
      }),

    reject: oc
      .route({
        method: 'POST',
        description: 'Reject a join request',
        summary: 'Reject Join Request',
        tags: ['Society Registration']
      })
      .input(rejectJoinRequestSchema)
      .output(
        z.object({
          success: z.boolean()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to reject join requests')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Join request not found')
          })
        }
      }),

    bulkApprove: oc
      .route({
        method: 'POST',
        description: 'Bulk approve join requests',
        summary: 'Bulk Approve Join Requests',
        tags: ['Society Registration']
      })
      .input(bulkApproveJoinRequestsSchema)
      .output(
        z.object({
          successful: z.number(),
          failed: z.number(),
          errors: z.array(
            z.object({
              requestId: z.string(),
              error: z.string()
            })
          )
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to approve join requests')
          })
        }
      }),

    bulkReject: oc
      .route({
        method: 'POST',
        description: 'Bulk reject join requests',
        summary: 'Bulk Reject Join Requests',
        tags: ['Society Registration']
      })
      .input(bulkRejectJoinRequestsSchema)
      .output(
        z.object({
          successful: z.number(),
          failed: z.number(),
          errors: z.array(
            z.object({
              requestId: z.string(),
              error: z.string()
            })
          )
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to reject join requests')
          })
        }
      }),

    getUserStatus: oc
      .route({
        method: 'GET',
        description: "Get user's join request status for a society",
        summary: 'Get User Join Request Status',
        tags: ['Society Registration']
      })
      .input(getUserJoinRequestStatusSchema)
      .output(
        z.object({
          hasRequest: z.boolean(),
          status: joinRequestStatusSchema.nullable(),
          requestId: z.string().nullable(),
          submittedAt: z.string().nullable(),
          rejectionReason: z.string().nullable()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        }
      })
  },

  // ============================================================================
  // Payment Verification
  // ============================================================================
  payment: {
    verify: oc
      .route({
        method: 'POST',
        description: 'Verify payment for a join request',
        summary: 'Verify Payment',
        tags: ['Society Registration']
      })
      .input(verifyPaymentSchema)
      .output(
        z.object({
          success: z.boolean()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to verify payments')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Join request not found')
          })
        }
      }),

    markNotVerified: oc
      .route({
        method: 'POST',
        description: 'Mark payment as not verified',
        summary: 'Mark Payment Not Verified',
        tags: ['Society Registration']
      })
      .input(markPaymentNotVerifiedSchema)
      .output(
        z.object({
          success: z.boolean()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to verify payments')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Join request not found')
          })
        }
      }),

    uploadProof: oc
      .route({
        method: 'POST',
        description: 'Upload payment proof',
        summary: 'Upload Payment Proof',
        tags: ['Society Registration']
      })
      .input(uploadPaymentProofSchema)
      .output(
        z.object({
          success: z.boolean()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Join request not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to upload payment proof')
          })
        }
      })
  },

  // ============================================================================
  // Public Registration Page
  // ============================================================================
  public: {
    checkAvailability: oc
      .route({
        method: 'GET',
        description: 'Check if registration is available for a society',
        summary: 'Check Registration Availability',
        tags: ['Society Registration']
      })
      .input(checkRegistrationAvailabilitySchema)
      .output(
        z.object({
          isAvailable: z.boolean(),
          reason: z
            .enum([
              'disabled',
              'paused',
              'full',
              'not_started',
              'ended',
              'private'
            ])
            .nullable(),
          message: z.string().nullable()
        })
      ),

    getPageData: oc
      .route({
        method: 'GET',
        description: 'Get public registration page data',
        summary: 'Get Public Registration Page',
        tags: ['Society Registration']
      })
      .input(getPublicRegistrationPageSchema)
      .output(
        z.object({
          society: z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string().nullable(),
            logo: z.string().nullable(),
            banner: z.string().nullable(),
            description: z.string().nullable(),
            memberCount: z.number(),
            meetingSchedule: z.string().nullable(),
            membershipRequirements: z.string().nullable(),
            goals: z.string().nullable(),
            instagram: z.string().nullable(),
            facebook: z.string().nullable(),
            twitter: z.string().nullable(),
            linkedin: z.string().nullable(),
            website: z.string().nullable(),
            primaryColor: z.string().nullable()
          }),
          settings: z.object({
            isEnabled: z.boolean(),
            isPaused: z.boolean(),
            welcomeMessage: z.string().nullable(),
            customBanner: z.string().nullable(),
            maxCapacity: z.number().nullable(),
            currentMemberCount: z.number(),
            remainingSlots: z.number().nullable(),
            startDate: z.string().nullable(),
            endDate: z.string().nullable()
          }),
          form: z
            .object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              paymentEnabled: z.boolean(),
              paymentAmount: z.string().nullable()
            })
            .nullable(),
          isAvailable: z.boolean(),
          unavailableReason: z.string().nullable()
        })
      )
      .errors({
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Society not found')
          })
        }
      })
  },

  // ============================================================================
  // QR Code Generation
  // ============================================================================
  qrCode: {
    generate: oc
      .route({
        method: 'GET',
        description: 'Generate QR code for registration URL',
        summary: 'Generate QR Code',
        tags: ['Society Registration']
      })
      .input(generateQRCodeSchema)
      .output(
        z.object({
          registrationUrl: z.string(),
          societyName: z.string(),
          societyLogo: z.string().nullable()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Society not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to generate QR codes')
          })
        }
      }),

    generatePrintable: oc
      .route({
        method: 'GET',
        description: 'Generate printable QR code with society branding',
        summary: 'Generate Printable QR Code',
        tags: ['Society Registration']
      })
      .input(generatePrintableQRCodeSchema)
      .output(
        z.object({
          html: z.string() // HTML content for printing
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Society not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to generate QR codes')
          })
        }
      })
  },

  // ============================================================================
  // Analytics
  // ============================================================================
  analytics: oc
    .route({
      method: 'GET',
      description: 'Get registration analytics for a society',
      summary: 'Get Registration Analytics',
      tags: ['Society Registration']
    })
    .input(getRegistrationAnalyticsSchema)
    .output(
      z.object({
        totalApplications: z.number(),
        pendingCount: z.number(),
        approvedCount: z.number(),
        rejectedCount: z.number(),
        paymentPendingCount: z.number(),
        approvalRate: z.number(),
        rejectionRate: z.number(),
        averageTimeToApproval: z.number(), // in hours
        applicationsByDate: z.array(
          z.object({
            date: z.string(),
            count: z.number()
          })
        ),
        applicationsByStatus: z.array(
          z.object({
            status: joinRequestStatusSchema,
            count: z.number()
          })
        )
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default('You do not have permission to view analytics')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Society not found')
        })
      }
    }),

  // ============================================================================
  // Export
  // ============================================================================
  export: oc
    .route({
      method: 'GET',
      description: 'Export join requests to CSV or Excel',
      summary: 'Export Join Requests',
      tags: ['Society Registration']
    })
    .input(exportJoinRequestsSchema)
    .output(
      z.object({
        fileUrl: z.string(), // URL to download the exported file
        fileName: z.string()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default('You do not have permission to export join requests')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Society not found')
        })
      }
    })
}
