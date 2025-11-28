import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  achievementSchema,
  createAchievementSchema,
  createEnrollmentSchema,
  createJourneySchema,
  createTermSchema,
  enrollmentSchema,
  journeySchema,
  termSchema,
  timelineSchema,
  updateAchievementSchema,
  updateEnrollmentSchema,
  updateJourneySchema,
  updateTermSchema
} from './academic-schemas'

export const academic = {
  journeys: {
    list: oc
      .route({
        method: 'GET',
        description: 'Get all academic journeys for the current user',
        summary: 'List Journeys',
        tags: ['Academic']
      })
      .output(
        z.object({
          journeys: z.array(journeySchema)
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        }
      }),

    create: oc
      .route({
        method: 'POST',
        description: 'Create a new academic journey',
        summary: 'Create Journey',
        tags: ['Academic']
      })
      .input(createJourneySchema)
      .output(
        z.object({
          success: z.boolean(),
          journey: journeySchema
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        INVALID_INPUT: {
          data: z.object({
            message: z.string(),
            field: z.string().optional()
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Institution not found')
          })
        }
      }),

    update: oc
      .route({
        method: 'PATCH',
        description: 'Update an academic journey',
        summary: 'Update Journey',
        tags: ['Academic']
      })
      .input(updateJourneySchema)
      .output(
        z.object({
          success: z.boolean(),
          journey: journeySchema
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
            message: z.string().default('Journey not found')
          })
        },
        INVALID_INPUT: {
          data: z.object({
            message: z.string(),
            field: z.string().optional()
          })
        }
      }),

    remove: oc
      .route({
        method: 'DELETE',
        description: 'Delete an academic journey and all related data',
        summary: 'Delete Journey',
        tags: ['Academic']
      })
      .input(
        z.object({
          id: z.string().min(1)
        })
      )
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
            message: z.string().default('Journey not found')
          })
        }
      })
  },

  terms: {
    list: oc
      .route({
        method: 'GET',
        description: 'Get all terms for a journey',
        summary: 'List Terms',
        tags: ['Academic']
      })
      .input(
        z.object({
          journeyId: z.string().min(1)
        })
      )
      .output(
        z.object({
          terms: z.array(termSchema)
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
            message: z.string().default('Journey not found')
          })
        }
      }),

    create: oc
      .route({
        method: 'POST',
        description: 'Create a new academic term',
        summary: 'Create Term',
        tags: ['Academic']
      })
      .input(createTermSchema)
      .output(
        z.object({
          success: z.boolean(),
          term: termSchema
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
            message: z.string().default('Journey not found')
          })
        },
        INVALID_INPUT: {
          data: z.object({
            message: z.string(),
            field: z.string().optional()
          })
        }
      }),

    update: oc
      .route({
        method: 'PATCH',
        description: 'Update an academic term',
        summary: 'Update Term',
        tags: ['Academic']
      })
      .input(updateTermSchema)
      .output(
        z.object({
          success: z.boolean(),
          term: termSchema
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
            message: z.string().default('Term not found')
          })
        },
        INVALID_INPUT: {
          data: z.object({
            message: z.string(),
            field: z.string().optional()
          })
        }
      }),

    remove: oc
      .route({
        method: 'DELETE',
        description: 'Delete an academic term and recalculate journey GPA',
        summary: 'Delete Term',
        tags: ['Academic']
      })
      .input(
        z.object({
          id: z.string().min(1)
        })
      )
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
            message: z.string().default('Term not found')
          })
        }
      })
  },

  enrollments: {
    list: oc
      .route({
        method: 'GET',
        description: 'Get all course enrollments for a term',
        summary: 'List Enrollments',
        tags: ['Academic']
      })
      .input(
        z.object({
          termId: z.string().min(1)
        })
      )
      .output(
        z.object({
          enrollments: z.array(enrollmentSchema)
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
            message: z.string().default('Term not found')
          })
        }
      }),

    create: oc
      .route({
        method: 'POST',
        description: 'Create a new course enrollment',
        summary: 'Create Enrollment',
        tags: ['Academic']
      })
      .input(createEnrollmentSchema)
      .output(
        z.object({
          success: z.boolean(),
          enrollment: enrollmentSchema
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
            message: z.string().default('Term or course not found')
          })
        },
        INVALID_INPUT: {
          data: z.object({
            message: z.string(),
            field: z.string().optional()
          })
        },
        REFERENTIAL_INTEGRITY: {
          data: z.object({
            message: z
              .string()
              .default('Course does not belong to journey institution')
          })
        }
      }),

    update: oc
      .route({
        method: 'PATCH',
        description: 'Update a course enrollment and recalculate GPAs',
        summary: 'Update Enrollment',
        tags: ['Academic']
      })
      .input(updateEnrollmentSchema)
      .output(
        z.object({
          success: z.boolean(),
          enrollment: enrollmentSchema
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
            message: z.string().default('Enrollment not found')
          })
        },
        INVALID_INPUT: {
          data: z.object({
            message: z.string(),
            field: z.string().optional()
          })
        }
      }),

    remove: oc
      .route({
        method: 'DELETE',
        description: 'Delete a course enrollment and recalculate GPAs',
        summary: 'Delete Enrollment',
        tags: ['Academic']
      })
      .input(
        z.object({
          id: z.string().min(1)
        })
      )
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
            message: z.string().default('Enrollment not found')
          })
        }
      })
  },

  achievements: {
    list: oc
      .route({
        method: 'GET',
        description: 'Get all achievements for a journey',
        summary: 'List Achievements',
        tags: ['Academic']
      })
      .input(
        z.object({
          journeyId: z.string().min(1)
        })
      )
      .output(
        z.object({
          achievements: z.array(achievementSchema)
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
            message: z.string().default('Journey not found')
          })
        }
      }),

    create: oc
      .route({
        method: 'POST',
        description: 'Create a new achievement',
        summary: 'Create Achievement',
        tags: ['Academic']
      })
      .input(createAchievementSchema)
      .output(
        z.object({
          success: z.boolean(),
          achievement: achievementSchema
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
            message: z.string().default('Journey not found')
          })
        },
        INVALID_INPUT: {
          data: z.object({
            message: z.string(),
            field: z.string().optional()
          })
        }
      }),

    update: oc
      .route({
        method: 'PATCH',
        description: 'Update an achievement',
        summary: 'Update Achievement',
        tags: ['Academic']
      })
      .input(updateAchievementSchema)
      .output(
        z.object({
          success: z.boolean(),
          achievement: achievementSchema
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
            message: z.string().default('Achievement not found')
          })
        },
        INVALID_INPUT: {
          data: z.object({
            message: z.string(),
            field: z.string().optional()
          })
        }
      }),

    remove: oc
      .route({
        method: 'DELETE',
        description: 'Delete an achievement',
        summary: 'Delete Achievement',
        tags: ['Academic']
      })
      .input(
        z.object({
          id: z.string().min(1)
        })
      )
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
            message: z.string().default('Achievement not found')
          })
        }
      })
  },

  timeline: oc
    .route({
      method: 'GET',
      description: 'Get complete academic timeline with all nested data',
      summary: 'Get Academic Timeline',
      tags: ['Academic']
    })
    .output(timelineSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      }
    })
}
