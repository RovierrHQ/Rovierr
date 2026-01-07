import { db } from '@api/db'
import { betterAuth } from '@api/middleware/auth'
import { FormService } from '@api/services/form'
import { getActiveSmartFields } from '@rov/shared'
import { Elysia } from 'elysia'
import { z } from 'zod'

const formService = new FormService(db)

// Simple input schemas - using z.object directly for efficiency
const createFormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  entityType: z.enum(['society', 'event', 'survey']),
  entityId: z.string().optional()
})

const updateFormSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional()
})

const bulkSaveFormSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  pages: z.array(z.any()).optional(),
  questions: z.array(z.any()).optional()
})

export const form = new Elysia({ prefix: '/form' })
  .use(betterAuth)
  // Form Management
  .post(
    '/create',
    async ({ body, user }) => {
      if (!user) throw new Error('User not authenticated')
      const createdForm = await formService.createForm(user.id, body)
      return {
        id: createdForm.id,
        title: createdForm.title,
        status: createdForm.status
      }
    },
    { body: createFormSchema }
  )

  .patch(
    '/update',
    async ({ body, user }) => {
      if (!user) throw new Error('User not authenticated')
      try {
        return await formService.updateForm(body.id, user.id, body)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Form not found')
            throw new Error('Form not found')
          if (error.message === 'Unauthorized')
            throw new Error('You do not have permission to edit this form')
        }
        throw error
      }
    },
    { body: updateFormSchema }
  )

  .get('/:id', async ({ params }) => {
    const formData = await formService.getFormById(params.id)
    if (!formData) throw new Error('Form not found')

    return {
      ...formData,
      openDate: formData.openDate?.toISOString() ?? null,
      closeDate: formData.closeDate?.toISOString() ?? null,
      publishedAt: formData.publishedAt?.toISOString() ?? null,
      allowMultipleSubmissions: formData.allowMultipleSubmissions ?? false,
      requireAuthentication: formData.requireAuthentication ?? true,
      paymentEnabled: formData.paymentEnabled ?? false,
      notificationsEnabled: formData.notificationsEnabled ?? false,
      confirmationEmailEnabled: formData.confirmationEmailEnabled ?? false,
      pages: formData.pages.map((page) => ({
        ...page,
        conditionalLogicEnabled: page.conditionalLogicEnabled ?? false
      })),
      questions: formData.questions.map((question) => ({
        ...question,
        required: question.required ?? false,
        conditionalLogicEnabled: question.conditionalLogicEnabled ?? false,
        enableAutoFill: question.enableAutoFill ?? false,
        enableBidirectionalSync: question.enableBidirectionalSync ?? false
      }))
    }
  })

  .get('/list', async ({ query, user }) => {
    if (!user) throw new Error('User not authenticated')
    const result = await formService.listForms({
      ...query,
      userId: user.id
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
  })

  .delete('/:id', async ({ params, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.deleteForm(params.id, user.id)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Form not found')
          throw new Error('Form not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to delete this form')
      }
      throw error
    }
  })

  .post('/:id/publish', async ({ params, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.publishForm(params.id, user.id)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Form not found')
          throw new Error('Form not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to publish this form')
      }
      throw error
    }
  })

  .post('/:id/unpublish', async ({ params, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.unpublishForm(params.id, user.id)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Form not found')
          throw new Error('Form not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to unpublish this form')
      }
      throw error
    }
  })

  .post('/:id/duplicate', async ({ params, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.duplicateForm(params.id, user.id)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Form not found')
          throw new Error('Form not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to duplicate this form')
      }
      throw error
    }
  })

  .post('/:id/archive', async ({ params, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.archiveForm(params.id, user.id)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Form not found')
          throw new Error('Form not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to archive this form')
      }
      throw error
    }
  })

  .post(
    '/bulk-save',
    async ({ body, user }) => {
      if (!user) throw new Error('User not authenticated')
      try {
        const result = await formService.bulkSaveForm(user.id, body)
        if (!result) throw new Error('Form not found')

        return {
          ...result,
          openDate: result.openDate?.toISOString() ?? null,
          closeDate: result.closeDate?.toISOString() ?? null,
          publishedAt: result.publishedAt?.toISOString() ?? null,
          allowMultipleSubmissions: result.allowMultipleSubmissions ?? false,
          requireAuthentication: result.requireAuthentication ?? true,
          paymentEnabled: result.paymentEnabled ?? false,
          notificationsEnabled: result.notificationsEnabled ?? false,
          confirmationEmailEnabled: result.confirmationEmailEnabled ?? false,
          pages: result.pages.map((page) => ({
            ...page,
            conditionalLogicEnabled: page.conditionalLogicEnabled ?? false
          })),
          questions: result.questions.map((question) => ({
            ...question,
            required: question.required ?? false,
            conditionalLogicEnabled: question.conditionalLogicEnabled ?? false,
            enableAutoFill: question.enableAutoFill ?? false,
            enableBidirectionalSync: question.enableBidirectionalSync ?? false
          }))
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Form not found')
            throw new Error('Form not found')
          if (error.message === 'Unauthorized')
            throw new Error('You do not have permission to edit this form')
        }
        throw error
      }
    },
    { body: bulkSaveFormSchema }
  )

  // Page Management
  .post('/page/create', async ({ body, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      const page = await formService.createPage(user.id, body)
      return { id: page.id, title: page.title, order: page.order }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Form not found')
          throw new Error('Form not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to create pages')
      }
      throw error
    }
  })

  .patch('/page/:id', async ({ params, body, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.updatePage(params.id, user.id, body)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Page not found')
          throw new Error('Page not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to update this page')
      }
      throw error
    }
  })

  .delete('/page/:id', async ({ params, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.deletePage(params.id, user.id)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Page not found')
          throw new Error('Page not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to delete this page')
      }
      throw error
    }
  })

  .post('/page/reorder', async ({ body, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.reorderPages(body.formId, user.id, body.pageIds)
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        throw new Error('You do not have permission to reorder pages')
      }
      throw error
    }
  })

  // Question Management
  .post('/question/create', async ({ body, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      const question = await formService.createQuestion(user.id, body)
      return { id: question.id, title: question.title, type: question.type }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Page not found')
          throw new Error('Page not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to create questions')
      }
      throw error
    }
  })

  .patch('/question/:id', async ({ params, body, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.updateQuestion(params.id, user.id, body)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Question not found')
          throw new Error('Question not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to update this question')
      }
      throw error
    }
  })

  .delete('/question/:id', async ({ params, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.deleteQuestion(params.id, user.id)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Question not found')
          throw new Error('Question not found')
        if (error.message === 'Unauthorized')
          throw new Error('You do not have permission to delete this question')
      }
      throw error
    }
  })

  .post('/question/reorder', async ({ body, user }) => {
    if (!user) throw new Error('User not authenticated')
    try {
      return await formService.reorderQuestions(
        body.pageId,
        user.id,
        body.questionIds
      )
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        throw new Error('You do not have permission to reorder questions')
      }
      throw error
    }
  })

  // Response Management (Stubs)
  .post('/response/submit', () => {
    throw new Error('Response submission not yet implemented')
  })

  .post('/response/save-progress', () => {
    throw new Error('Save progress not yet implemented')
  })

  .get('/response/list', () => {
    throw new Error('Response listing not yet implemented')
  })

  .get('/response/:id', () => {
    throw new Error('Response retrieval not yet implemented')
  })

  .delete('/response/:id', () => {
    throw new Error('Response deletion not yet implemented')
  })

  // Template Management (Stubs)
  .post('/template/save-as', () => {
    throw new Error('Template creation not yet implemented')
  })

  .get('/template/list', () => {
    throw new Error('Template listing not yet implemented')
  })

  .post('/template/create-from', () => {
    throw new Error('Create from template not yet implemented')
  })

  .delete('/template/:id', () => {
    throw new Error('Template deletion not yet implemented')
  })

  // Smart Fields
  .get('/smart-field/auto-fill', () => {
    throw new Error('Auto-fill not yet implemented')
  })

  .get('/smart-field/mappings', () => {
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
  })

  // Analytics (Stub)
  .get('/analytics/:id', () => {
    throw new Error('Analytics not yet implemented')
  })
