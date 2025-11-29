import { oc } from '@orpc/contract'
import { z } from 'zod'
import { fullFormSchema } from './generated-schemas'
import {
  createFormSchema,
  createFromTemplateSchema,
  createPageSchema,
  createQuestionSchema,
  entityTypeSchema,
  formIdSchema,
  formStatusSchema,
  getAnalyticsSchema,
  getAutoFillDataSchema,
  listFormsSchema,
  listResponsesSchema,
  listTemplatesSchema,
  paymentStatusSchema,
  profileFieldCategorySchema,
  profileFieldDataTypeSchema,
  questionTypeSchema,
  reorderPagesSchema,
  reorderQuestionsSchema,
  responseStatusSchema,
  saveAsTemplateSchema,
  saveProgressSchema,
  submitResponseSchema,
  templateCategorySchema,
  updateFormSchema,
  updatePageSchema,
  updateQuestionSchema
} from './schemas'

export const form = {
  // ============================================================================
  // Form Management
  // ============================================================================
  create: oc
    .route({
      method: 'POST',
      description: 'Create a new form',
      summary: 'Create Form',
      tags: ['Form']
    })
    .input(createFormSchema)
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        status: formStatusSchema
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
          message: z.string()
        })
      }
    }),

  update: oc
    .route({
      method: 'PATCH',
      description: 'Update an existing form',
      summary: 'Update Form',
      tags: ['Form']
    })
    .input(updateFormSchema)
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
          message: z.string().default('Form not found')
        })
      },
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default('You do not have permission to edit this form')
        })
      }
    }),

  get: oc
    .route({
      method: 'GET',
      description: 'Get a form by ID',
      summary: 'Get Form',
      tags: ['Form']
    })
    .input(formIdSchema)
    .output(fullFormSchema)
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Form not found')
        })
      }
    }),

  list: oc
    .route({
      method: 'GET',
      description: 'List forms with filters',
      summary: 'List Forms',
      tags: ['Form']
    })
    .input(listFormsSchema)
    .output(
      z.object({
        forms: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            entityType: entityTypeSchema,
            entityId: z.string(),
            status: formStatusSchema,
            createdAt: z.string(),
            updatedAt: z.string(),
            publishedAt: z.string().nullable(),
            responseCount: z.number()
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
      }
    }),

  delete: oc
    .route({
      method: 'DELETE',
      description: 'Delete a form',
      summary: 'Delete Form',
      tags: ['Form']
    })
    .input(formIdSchema)
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
          message: z.string().default('Form not found')
        })
      },
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default('You do not have permission to delete this form')
        })
      }
    }),

  publish: oc
    .route({
      method: 'POST',
      description: 'Publish a form',
      summary: 'Publish Form',
      tags: ['Form']
    })
    .input(formIdSchema)
    .output(
      z.object({
        success: z.boolean(),
        publishedAt: z.string()
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
          message: z.string().default('Form not found')
        })
      },
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default('You do not have permission to publish this form')
        })
      }
    }),

  unpublish: oc
    .route({
      method: 'POST',
      description: 'Unpublish a form',
      summary: 'Unpublish Form',
      tags: ['Form']
    })
    .input(formIdSchema)
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
          message: z.string().default('Form not found')
        })
      }
    }),

  duplicate: oc
    .route({
      method: 'POST',
      description: 'Duplicate a form',
      summary: 'Duplicate Form',
      tags: ['Form']
    })
    .input(formIdSchema)
    .output(
      z.object({
        id: z.string(),
        title: z.string()
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
          message: z.string().default('Form not found')
        })
      }
    }),

  archive: oc
    .route({
      method: 'POST',
      description: 'Archive a form',
      summary: 'Archive Form',
      tags: ['Form']
    })
    .input(formIdSchema)
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
          message: z.string().default('Form not found')
        })
      }
    }),

  // ============================================================================
  // Page Management
  // ============================================================================
  page: {
    create: oc
      .route({
        method: 'POST',
        description: 'Create a new page',
        summary: 'Create Page',
        tags: ['Form']
      })
      .input(createPageSchema)
      .output(
        z.object({
          id: z.string(),
          title: z.string(),
          order: z.number()
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
            message: z.string().default('Form not found')
          })
        }
      }),

    update: oc
      .route({
        method: 'PATCH',
        description: 'Update a page',
        summary: 'Update Page',
        tags: ['Form']
      })
      .input(updatePageSchema)
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
            message: z.string().default('Page not found')
          })
        }
      }),

    delete: oc
      .route({
        method: 'DELETE',
        description: 'Delete a page',
        summary: 'Delete Page',
        tags: ['Form']
      })
      .input(z.object({ id: z.string() }))
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
            message: z.string().default('Page not found')
          })
        }
      }),

    reorder: oc
      .route({
        method: 'POST',
        description: 'Reorder pages',
        summary: 'Reorder Pages',
        tags: ['Form']
      })
      .input(reorderPagesSchema)
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
        }
      })
  },

  // ============================================================================
  // Question Management
  // ============================================================================
  question: {
    create: oc
      .route({
        method: 'POST',
        description: 'Create a new question',
        summary: 'Create Question',
        tags: ['Form']
      })
      .input(createQuestionSchema)
      .output(
        z.object({
          id: z.string(),
          title: z.string(),
          type: questionTypeSchema
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
            message: z.string().default('Page not found')
          })
        }
      }),

    update: oc
      .route({
        method: 'PATCH',
        description: 'Update a question',
        summary: 'Update Question',
        tags: ['Form']
      })
      .input(updateQuestionSchema)
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
            message: z.string().default('Question not found')
          })
        }
      }),

    delete: oc
      .route({
        method: 'DELETE',
        description: 'Delete a question',
        summary: 'Delete Question',
        tags: ['Form']
      })
      .input(z.object({ id: z.string() }))
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
            message: z.string().default('Question not found')
          })
        }
      }),

    reorder: oc
      .route({
        method: 'POST',
        description: 'Reorder questions',
        summary: 'Reorder Questions',
        tags: ['Form']
      })
      .input(reorderQuestionsSchema)
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
        }
      })
  },

  // ============================================================================
  // Response Management
  // ============================================================================
  response: {
    submit: oc
      .route({
        method: 'POST',
        description: 'Submit a form response',
        summary: 'Submit Response',
        tags: ['Form']
      })
      .input(submitResponseSchema)
      .output(
        z.object({
          id: z.string(),
          submittedAt: z.string(),
          requiresPayment: z.boolean(),
          paymentIntentId: z.string().optional()
        })
      )
      .errors({
        FORM_CLOSED: {
          data: z.object({
            message: z.string().default('Form is closed')
          })
        },
        FORM_FULL: {
          data: z.object({
            message: z.string().default('Form has reached maximum responses')
          })
        },
        VALIDATION_ERROR: {
          data: z.object({
            message: z.string(),
            errors: z.record(z.string(), z.string())
          })
        }
      }),

    saveProgress: oc
      .route({
        method: 'POST',
        description: 'Save form progress',
        summary: 'Save Progress',
        tags: ['Form']
      })
      .input(saveProgressSchema)
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
        }
      }),

    list: oc
      .route({
        method: 'GET',
        description: 'List form responses',
        summary: 'List Responses',
        tags: ['Form']
      })
      .input(listResponsesSchema)
      .output(
        z.object({
          responses: z.array(
            z.object({
              id: z.string(),
              userId: z.string().nullable(),
              userName: z.string().nullable(),
              answers: z.record(z.string(), z.unknown()),
              paymentStatus: paymentStatusSchema,
              status: responseStatusSchema,
              submittedAt: z.string(),
              completionTime: z.number().nullable()
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
              .default('You do not have permission to view responses')
          })
        }
      }),

    get: oc
      .route({
        method: 'GET',
        description: 'Get a single response',
        summary: 'Get Response',
        tags: ['Form']
      })
      .input(z.object({ id: z.string() }))
      .output(
        z.object({
          id: z.string(),
          formId: z.string(),
          userId: z.string().nullable(),
          userName: z.string().nullable(),
          answers: z.record(z.string(), z.unknown()),
          paymentStatus: paymentStatusSchema,
          paymentAmount: z.string().nullable(),
          status: responseStatusSchema,
          submittedAt: z.string(),
          completionTime: z.number().nullable(),
          ipAddress: z.string().nullable()
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
            message: z.string().default('Response not found')
          })
        }
      }),

    delete: oc
      .route({
        method: 'DELETE',
        description: 'Delete a response',
        summary: 'Delete Response',
        tags: ['Form']
      })
      .input(z.object({ id: z.string() }))
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
            message: z.string().default('Response not found')
          })
        }
      })
  },

  // ============================================================================
  // Template Management
  // ============================================================================
  template: {
    saveAs: oc
      .route({
        method: 'POST',
        description: 'Save form as template',
        summary: 'Save As Template',
        tags: ['Form']
      })
      .input(saveAsTemplateSchema)
      .output(
        z.object({
          id: z.string(),
          name: z.string()
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
            message: z.string().default('Form not found')
          })
        }
      }),

    list: oc
      .route({
        method: 'GET',
        description: 'List templates',
        summary: 'List Templates',
        tags: ['Form']
      })
      .input(listTemplatesSchema)
      .output(
        z.object({
          templates: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              category: templateCategorySchema.nullable(),
              isPublic: z.boolean(),
              usageCount: z.number(),
              createdAt: z.string()
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
        }
      }),

    createFrom: oc
      .route({
        method: 'POST',
        description: 'Create form from template',
        summary: 'Create From Template',
        tags: ['Form']
      })
      .input(createFromTemplateSchema)
      .output(
        z.object({
          id: z.string(),
          title: z.string()
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
            message: z.string().default('Template not found')
          })
        }
      }),

    delete: oc
      .route({
        method: 'DELETE',
        description: 'Delete a template',
        summary: 'Delete Template',
        tags: ['Form']
      })
      .input(z.object({ id: z.string() }))
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
            message: z.string().default('Template not found')
          })
        }
      })
  },

  // ============================================================================
  // Smart Fields
  // ============================================================================
  smartField: {
    getAutoFillData: oc
      .route({
        method: 'GET',
        description: 'Get auto-fill data for a form',
        summary: 'Get Auto-fill Data',
        tags: ['Form']
      })
      .input(getAutoFillDataSchema)
      .output(
        z.object({
          data: z.record(
            z.string(),
            z.object({
              value: z.unknown(),
              source: z.enum(['profile', 'saved_progress']),
              isComplete: z.boolean()
            })
          )
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        }
      }),

    listMappings: oc
      .route({
        method: 'GET',
        description: 'List available profile field mappings',
        summary: 'List Field Mappings',
        tags: ['Form']
      })
      .output(
        z.object({
          mappings: z.array(
            z.object({
              id: z.string(),
              fieldKey: z.string(),
              displayLabel: z.string(),
              category: profileFieldCategorySchema,
              dataType: profileFieldDataTypeSchema,
              description: z.string().nullable(),
              isActive: z.boolean(),
              populationRate: z.number().optional()
            })
          )
        })
      )
  },

  // ============================================================================
  // Analytics
  // ============================================================================
  analytics: oc
    .route({
      method: 'GET',
      description: 'Get form analytics',
      summary: 'Get Analytics',
      tags: ['Form']
    })
    .input(getAnalyticsSchema)
    .output(
      z.object({
        totalResponses: z.number(),
        completionRate: z.number(),
        averageCompletionTime: z.number(),
        responsesByDate: z.array(
          z.object({
            date: z.string(),
            count: z.number()
          })
        ),
        questionAnalytics: z.array(
          z.object({
            questionId: z.string(),
            questionTitle: z.string(),
            responseDistribution: z.record(z.string(), z.number())
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
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Form not found')
        })
      }
    })
}
