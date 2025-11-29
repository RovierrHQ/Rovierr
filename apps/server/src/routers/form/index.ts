import { ORPCError } from '@orpc/server'
import { getActiveSmartFields } from '@rov/shared'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { FormService } from '@/services/form'

const formService = new FormService(db)

export const form = {
  // ============================================================================
  // Form Management
  // ============================================================================
  create: protectedProcedure.form.create.handler(async ({ input, context }) => {
    const createdForm = await formService.createForm(
      context.session.user.id,
      input
    )

    return {
      id: createdForm.id,
      title: createdForm.title,
      status: createdForm.status
    }
  }),

  update: protectedProcedure.form.update.handler(async ({ input, context }) => {
    try {
      return await formService.updateForm(
        input.id,
        context.session.user.id,
        input
      )
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Form not found') {
          throw new ORPCError('NOT_FOUND', { message: 'Form not found' })
        }
        if (error.message === 'Unauthorized') {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to edit this form'
          })
        }
      }
      throw error
    }
  }),

  get: protectedProcedure.form.get.handler(async ({ input }) => {
    const formData = await formService.getFormById(input.id)

    if (!formData) {
      throw new ORPCError('NOT_FOUND', { message: 'Form not found' })
    }

    // Transform Date objects to ISO strings for API response
    return {
      ...formData,
      openDate: formData.openDate?.toISOString() ?? null,
      closeDate: formData.closeDate?.toISOString() ?? null,
      publishedAt: formData.publishedAt?.toISOString() ?? null
    }
  }),

  list: protectedProcedure.form.list.handler(async ({ input, context }) => {
    const result = await formService.listForms({
      ...input,
      userId: context.session.user.id
    })

    return {
      forms: result.forms.map((formItem) => ({
        ...formItem,
        openDate: formItem.openDate?.toISOString() || null,
        closeDate: formItem.closeDate?.toISOString() || null,
        publishedAt: formItem.publishedAt?.toISOString() || null,
        createdAt: formItem.createdAt,
        updatedAt: formItem.updatedAt
      })),
      total: result.total,
      hasMore: result.hasMore
    }
  }),

  delete: protectedProcedure.form.delete.handler(async ({ input, context }) => {
    try {
      return await formService.deleteForm(input.id, context.session.user.id)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Form not found') {
          throw new ORPCError('NOT_FOUND', { message: 'Form not found' })
        }
        if (error.message === 'Unauthorized') {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to delete this form'
          })
        }
      }
      throw error
    }
  }),

  publish: protectedProcedure.form.publish.handler(
    async ({ input, context }) => {
      try {
        return await formService.publishForm(input.id, context.session.user.id)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Form not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Form not found' })
          }
          if (error.message === 'Unauthorized') {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to publish this form'
            })
          }
        }
        throw error
      }
    }
  ),

  unpublish: protectedProcedure.form.unpublish.handler(
    async ({ input, context }) => {
      try {
        return await formService.unpublishForm(
          input.id,
          context.session.user.id
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Form not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Form not found' })
          }
          if (error.message === 'Unauthorized') {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to unpublish this form'
            })
          }
        }
        throw error
      }
    }
  ),

  duplicate: protectedProcedure.form.duplicate.handler(
    async ({ input, context }) => {
      try {
        return await formService.duplicateForm(
          input.id,
          context.session.user.id
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Form not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Form not found' })
          }
          if (error.message === 'Unauthorized') {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to duplicate this form'
            })
          }
        }
        throw error
      }
    }
  ),

  archive: protectedProcedure.form.archive.handler(
    async ({ input, context }) => {
      try {
        return await formService.archiveForm(input.id, context.session.user.id)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Form not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Form not found' })
          }
          if (error.message === 'Unauthorized') {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to archive this form'
            })
          }
        }
        throw error
      }
    }
  ),

  // ============================================================================
  // Page Management
  // ============================================================================
  page: {
    create: protectedProcedure.form.page.create.handler(
      async ({ input, context }) => {
        try {
          const page = await formService.createPage(
            context.session.user.id,
            input
          )
          return {
            id: page.id,
            title: page.title,
            order: page.order
          }
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === 'Form not found') {
              throw new ORPCError('NOT_FOUND', { message: 'Form not found' })
            }
            if (error.message === 'Unauthorized') {
              throw new ORPCError('FORBIDDEN', {
                message: 'You do not have permission to create pages'
              })
            }
          }
          throw error
        }
      }
    ),

    update: protectedProcedure.form.page.update.handler(
      async ({ input, context }) => {
        try {
          return await formService.updatePage(
            input.id,
            context.session.user.id,
            input
          )
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === 'Page not found') {
              throw new ORPCError('NOT_FOUND', { message: 'Page not found' })
            }
            if (error.message === 'Unauthorized') {
              throw new ORPCError('FORBIDDEN', {
                message: 'You do not have permission to update this page'
              })
            }
          }
          throw error
        }
      }
    ),

    delete: protectedProcedure.form.page.delete.handler(
      async ({ input, context }) => {
        try {
          return await formService.deletePage(input.id, context.session.user.id)
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === 'Page not found') {
              throw new ORPCError('NOT_FOUND', { message: 'Page not found' })
            }
            if (error.message === 'Unauthorized') {
              throw new ORPCError('FORBIDDEN', {
                message: 'You do not have permission to delete this page'
              })
            }
          }
          throw error
        }
      }
    ),

    reorder: protectedProcedure.form.page.reorder.handler(
      async ({ input, context }) => {
        try {
          return await formService.reorderPages(
            input.formId,
            context.session.user.id,
            input.pageIds
          )
        } catch (error) {
          if (error instanceof Error && error.message === 'Unauthorized') {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to reorder pages'
            })
          }
          throw error
        }
      }
    )
  },

  // ============================================================================
  // Question Management
  // ============================================================================
  question: {
    create: protectedProcedure.form.question.create.handler(
      async ({ input, context }) => {
        try {
          const question = await formService.createQuestion(
            context.session.user.id,
            input
          )
          return {
            id: question.id,
            title: question.title,
            type: question.type
          }
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === 'Page not found') {
              throw new ORPCError('NOT_FOUND', { message: 'Page not found' })
            }
            if (error.message === 'Unauthorized') {
              throw new ORPCError('FORBIDDEN', {
                message: 'You do not have permission to create questions'
              })
            }
          }
          throw error
        }
      }
    ),

    update: protectedProcedure.form.question.update.handler(
      async ({ input, context }) => {
        try {
          return await formService.updateQuestion(
            input.id,
            context.session.user.id,
            input
          )
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === 'Question not found') {
              throw new ORPCError('NOT_FOUND', {
                message: 'Question not found'
              })
            }
            if (error.message === 'Unauthorized') {
              throw new ORPCError('FORBIDDEN', {
                message: 'You do not have permission to update this question'
              })
            }
          }
          throw error
        }
      }
    ),

    delete: protectedProcedure.form.question.delete.handler(
      async ({ input, context }) => {
        try {
          return await formService.deleteQuestion(
            input.id,
            context.session.user.id
          )
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === 'Question not found') {
              throw new ORPCError('NOT_FOUND', {
                message: 'Question not found'
              })
            }
            if (error.message === 'Unauthorized') {
              throw new ORPCError('FORBIDDEN', {
                message: 'You do not have permission to delete this question'
              })
            }
          }
          throw error
        }
      }
    ),

    reorder: protectedProcedure.form.question.reorder.handler(
      async ({ input, context }) => {
        try {
          return await formService.reorderQuestions(
            input.pageId,
            context.session.user.id,
            input.questionIds
          )
        } catch (error) {
          if (error instanceof Error && error.message === 'Unauthorized') {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to reorder questions'
            })
          }
          throw error
        }
      }
    )
  },

  // ============================================================================
  // Response Management (Stubs for now)
  // ============================================================================
  response: {
    submit: protectedProcedure.form.response.submit.handler(() => {
      // TODO: Implement in Task 17
      throw new ORPCError('NOT_IMPLEMENTED', {
        message: 'Response submission not yet implemented'
      })
    }),

    saveProgress: protectedProcedure.form.response.saveProgress.handler(() => {
      // TODO: Implement in Task 17
      throw new ORPCError('NOT_IMPLEMENTED', {
        message: 'Save progress not yet implemented'
      })
    }),

    list: protectedProcedure.form.response.list.handler(() => {
      // TODO: Implement in Task 21
      throw new ORPCError('NOT_IMPLEMENTED', {
        message: 'Response listing not yet implemented'
      })
    }),

    get: protectedProcedure.form.response.get.handler(() => {
      // TODO: Implement in Task 21
      throw new ORPCError('NOT_IMPLEMENTED', {
        message: 'Response retrieval not yet implemented'
      })
    }),

    delete: protectedProcedure.form.response.delete.handler(() => {
      // TODO: Implement in Task 21
      throw new ORPCError('NOT_IMPLEMENTED', {
        message: 'Response deletion not yet implemented'
      })
    })
  },

  // ============================================================================
  // Template Management (Stubs for now)
  // ============================================================================
  template: {
    saveAs: protectedProcedure.form.template.saveAs.handler(() => {
      // TODO: Implement in Task 24
      throw new ORPCError('NOT_IMPLEMENTED', {
        message: 'Template creation not yet implemented'
      })
    }),

    list: protectedProcedure.form.template.list.handler(() => {
      // TODO: Implement in Task 24
      throw new ORPCError('NOT_IMPLEMENTED', {
        message: 'Template listing not yet implemented'
      })
    }),

    createFrom: protectedProcedure.form.template.createFrom.handler(() => {
      // TODO: Implement in Task 24
      throw new ORPCError('NOT_IMPLEMENTED', {
        message: 'Create from template not yet implemented'
      })
    }),

    delete: protectedProcedure.form.template.delete.handler(() => {
      // TODO: Implement in Task 24
      throw new ORPCError('NOT_IMPLEMENTED', {
        message: 'Template deletion not yet implemented'
      })
    })
  },

  // ============================================================================
  // Smart Fields
  // ============================================================================
  smartField: {
    getAutoFillData: protectedProcedure.form.smartField.getAutoFillData.handler(
      () => {
        // TODO: Implement in Task 14
        throw new ORPCError('NOT_IMPLEMENTED', {
          message: 'Auto-fill not yet implemented'
        })
      }
    ),

    listMappings: protectedProcedure.form.smartField.listMappings.handler(
      () => {
        const mappings = getActiveSmartFields()

        return {
          mappings: mappings.map((mapping) => ({
            id: mapping.id,
            fieldKey: mapping.fieldKey,
            displayLabel: mapping.displayLabel,
            category: mapping.category,
            dataType: mapping.dataType,
            description: mapping.description || null,
            isActive: mapping.isActive
          }))
        }
      }
    )
  },

  // ============================================================================
  // Analytics (Stub for now)
  // ============================================================================
  analytics: protectedProcedure.form.analytics.handler(() => {
    // TODO: Implement in Task 23
    throw new ORPCError('NOT_IMPLEMENTED', {
      message: 'Analytics not yet implemented'
    })
  })
}
