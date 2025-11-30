/**
 * Form Service
 * Handles form CRUD operations, publishing, duplication, and archival
 */

import {
  type DB,
  formPages,
  formQuestions,
  formResponses,
  forms
} from '@rov/db'
import type {
  BulkSaveFormInput,
  CreateFormInput,
  CreatePageInput,
  CreateQuestionInput,
  UpdateFormInput,
  UpdatePageInput,
  UpdateQuestionInput
} from '@rov/orpc-contracts'
import { and, count, desc, eq } from 'drizzle-orm'

// Re-export conditional logic functions
export {
  clearHiddenQuestionValues,
  detectCircularDependencies,
  evaluateCondition,
  evaluateConditionalLogic,
  getVisiblePages,
  getVisibleQuestions,
  validateConditionalLogic
} from './conditional-logic'
// Re-export validation functions
export {
  createFormSchema,
  createQuestionSchema,
  scanFileForMalware,
  validateFile,
  validateFormResponse
} from './validation'

export class FormService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  // ============================================================================
  // Form Management
  // ============================================================================

  /**
   * Create a new form
   */
  async createForm(userId: string, input: CreateFormInput) {
    const [form] = await this.db
      .insert(forms)
      .values({
        title: input.title,
        description: input.description,
        entityType: input.entityType,
        entityId: input.entityId,
        allowMultipleSubmissions: input.allowMultipleSubmissions,
        requireAuthentication: input.requireAuthentication,
        openDate: input.openDate ? new Date(input.openDate) : null,
        closeDate: input.closeDate ? new Date(input.closeDate) : null,
        maxResponses: input.maxResponses,
        paymentEnabled: input.paymentEnabled,
        paymentAmount: input.paymentAmount,
        paymentCurrency: 'HKD', // Fixed currency for now
        notificationsEnabled: input.notificationsEnabled,
        notificationEmails: input.notificationEmails,
        confirmationMessage: input.confirmationMessage,
        confirmationEmailEnabled: input.confirmationEmailEnabled,
        confirmationEmailContent: input.confirmationEmailContent,
        createdBy: userId,
        status: 'draft'
      })
      .returning()

    // Create default first page
    await this.db.insert(formPages).values({
      formId: form.id,
      title: 'Page 1',
      order: 0
    })

    return form
  }

  /**
   * Update a form
   */
  async updateForm(formId: string, userId: string, input: UpdateFormInput) {
    // Verify ownership
    const form = await this.getFormById(formId)
    if (!form) {
      throw new Error('Form not found')
    }
    if (form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    const { id: _id, paymentCurrency: _currency, ...rest } = input
    const updateData: Record<string, unknown> = {
      ...rest,
      openDate: rest.openDate ? new Date(rest.openDate) : undefined,
      closeDate: rest.closeDate ? new Date(rest.closeDate) : undefined
    }

    // Remove undefined values
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    }

    await this.db.update(forms).set(updateData).where(eq(forms.id, formId))

    return { success: true }
  }

  /**
   * Get form by ID with pages and questions
   */
  async getFormById(formId: string) {
    const [form] = await this.db
      .select()
      .from(forms)
      .where(eq(forms.id, formId))
      .limit(1)

    if (!form) return null

    // Get pages
    const pages = await this.db
      .select()
      .from(formPages)
      .where(eq(formPages.formId, formId))
      .orderBy(formPages.order)

    // Get questions
    const questions = await this.db
      .select()
      .from(formQuestions)
      .where(eq(formQuestions.formId, formId))
      .orderBy(formQuestions.order)

    return {
      ...form,
      pages,
      questions
    }
  }

  /**
   * List forms with filters
   */
  async listForms(filters: {
    entityType?: 'society' | 'event' | 'survey'
    entityId?: string
    status?: 'draft' | 'published' | 'closed' | 'archived'
    userId?: string
    limit?: number
    offset?: number
  }) {
    const conditions: ReturnType<typeof eq>[] = []

    if (filters.entityType) {
      conditions.push(eq(forms.entityType, filters.entityType))
    }
    if (filters.entityId) {
      conditions.push(eq(forms.entityId, filters.entityId))
    }
    if (filters.status) {
      conditions.push(eq(forms.status, filters.status))
    }
    if (filters.userId) {
      conditions.push(eq(forms.createdBy, filters.userId))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get forms
    const formsList = await this.db
      .select()
      .from(forms)
      .where(whereClause)
      .orderBy(desc(forms.updatedAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0)

    // Get response counts for each form
    const formsWithCounts = await Promise.all(
      formsList.map(async (form) => {
        const [result] = await this.db
          .select({ count: count() })
          .from(formResponses)
          .where(eq(formResponses.formId, form.id))

        return {
          ...form,
          responseCount: result?.count || 0
        }
      })
    )

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(forms)
      .where(whereClause)

    const total = totalResult?.count || 0
    const hasMore = (filters.offset || 0) + formsList.length < total

    return {
      forms: formsWithCounts,
      total,
      hasMore
    }
  }

  /**
   * Delete a form
   */
  async deleteForm(formId: string, userId: string) {
    // Verify ownership
    const form = await this.getFormById(formId)
    if (!form) {
      throw new Error('Form not found')
    }
    if (form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    await this.db.delete(forms).where(eq(forms.id, formId))

    return { success: true }
  }

  /**
   * Publish a form
   */
  async publishForm(formId: string, userId: string) {
    // Verify ownership
    const form = await this.getFormById(formId)
    if (!form) {
      throw new Error('Form not found')
    }
    if (form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    const publishedAt = new Date().toISOString()

    await this.db
      .update(forms)
      .set({
        status: 'published',
        publishedAt: new Date(publishedAt)
      })
      .where(eq(forms.id, formId))

    return { success: true, publishedAt }
  }

  /**
   * Unpublish a form
   */
  async unpublishForm(formId: string, userId: string) {
    // Verify ownership
    const form = await this.getFormById(formId)
    if (!form) {
      throw new Error('Form not found')
    }
    if (form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    await this.db
      .update(forms)
      .set({
        status: 'draft'
      })
      .where(eq(forms.id, formId))

    return { success: true }
  }

  /**
   * Duplicate a form
   */
  async duplicateForm(formId: string, userId: string) {
    // Get original form
    const originalForm = await this.getFormById(formId)
    if (!originalForm) {
      throw new Error('Form not found')
    }
    if (originalForm.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    // Create new form
    const [newForm] = await this.db
      .insert(forms)
      .values({
        title: `${originalForm.title} (Copy)`,
        description: originalForm.description,
        entityType: originalForm.entityType,
        entityId: originalForm.entityId,
        status: 'draft',
        allowMultipleSubmissions: originalForm.allowMultipleSubmissions,
        requireAuthentication: originalForm.requireAuthentication,
        openDate: originalForm.openDate,
        closeDate: originalForm.closeDate,
        maxResponses: originalForm.maxResponses,
        paymentEnabled: originalForm.paymentEnabled,
        paymentAmount: originalForm.paymentAmount,
        paymentCurrency: originalForm.paymentCurrency,
        notificationsEnabled: originalForm.notificationsEnabled,
        notificationEmails: originalForm.notificationEmails,
        confirmationMessage: originalForm.confirmationMessage,
        confirmationEmailEnabled: originalForm.confirmationEmailEnabled,
        confirmationEmailContent: originalForm.confirmationEmailContent,
        createdBy: userId
      })
      .returning()

    // Duplicate pages
    const pageMapping = new Map<string, string>()
    const newPages = await Promise.all(
      originalForm.pages.map((page) =>
        this.db
          .insert(formPages)
          .values({
            formId: newForm.id,
            title: page.title,
            description: page.description,
            order: page.order,
            conditionalLogicEnabled: page.conditionalLogicEnabled,
            condition: page.condition,
            conditionValue: page.conditionValue
          })
          .returning()
      )
    )

    originalForm.pages.forEach((page, index) => {
      const newPage = newPages[index]?.[0]
      if (newPage) {
        pageMapping.set(page.id, newPage.id)
      }
    })

    // Duplicate questions
    const questionMapping = new Map<string, string>()
    const questionsToCreate = originalForm.questions
      .map((question) => {
        const newPageId = pageMapping.get(question.pageId)
        if (!newPageId) return null
        return { question, newPageId }
      })
      .filter(
        (
          item
        ): item is {
          question: (typeof originalForm.questions)[0]
          newPageId: string
        } => item !== null
      )

    const newQuestions = await Promise.all(
      questionsToCreate.map(({ question, newPageId }) =>
        this.db
          .insert(formQuestions)
          .values({
            formId: newForm.id,
            pageId: newPageId,
            type: question.type,
            title: question.title,
            description: question.description,
            placeholder: question.placeholder,
            required: question.required,
            order: question.order,
            options: question.options,
            validationRules: question.validationRules,
            conditionalLogicEnabled: question.conditionalLogicEnabled,
            condition: question.condition,
            conditionValue: question.conditionValue,
            profileFieldKey: question.profileFieldKey,
            enableAutoFill: question.enableAutoFill,
            enableBidirectionalSync: question.enableBidirectionalSync,
            acceptedFileTypes: question.acceptedFileTypes,
            maxFileSize: question.maxFileSize
          })
          .returning()
      )
    )

    questionsToCreate.forEach((item, index) => {
      const newQuestion = newQuestions[index]?.[0]
      if (newQuestion) {
        questionMapping.set(item.question.id, newQuestion.id)
      }
    })

    // Update conditional logic references
    const pageUpdates: Promise<unknown>[] = []
    for (const [oldPageId, newPageId] of pageMapping) {
      const page = originalForm.pages.find((p) => p.id === oldPageId)
      if (page?.sourceQuestionId) {
        const newSourceQuestionId = questionMapping.get(page.sourceQuestionId)
        if (newSourceQuestionId) {
          pageUpdates.push(
            this.db
              .update(formPages)
              .set({ sourceQuestionId: newSourceQuestionId })
              .where(eq(formPages.id, newPageId))
          )
        }
      }
    }

    const questionUpdates: Promise<unknown>[] = []
    for (const [oldQuestionId, newQuestionId] of questionMapping) {
      const question = originalForm.questions.find(
        (q) => q.id === oldQuestionId
      )
      if (question?.sourceQuestionId) {
        const newSourceQuestionId = questionMapping.get(
          question.sourceQuestionId
        )
        if (newSourceQuestionId) {
          questionUpdates.push(
            this.db
              .update(formQuestions)
              .set({ sourceQuestionId: newSourceQuestionId })
              .where(eq(formQuestions.id, newQuestionId))
          )
        }
      }
    }

    await Promise.all([...pageUpdates, ...questionUpdates])

    return {
      id: newForm.id,
      title: newForm.title
    }
  }

  /**
   * Archive a form
   */
  async archiveForm(formId: string, userId: string) {
    // Verify ownership
    const form = await this.getFormById(formId)
    if (!form) {
      throw new Error('Form not found')
    }
    if (form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    await this.db
      .update(forms)
      .set({
        status: 'archived'
      })
      .where(eq(forms.id, formId))

    return { success: true }
  }

  /**
   * Bulk save form with all pages and questions in one transaction
   * This is much more efficient than making multiple API calls
   */
  async bulkSaveForm(userId: string, input: BulkSaveFormInput) {
    // Verify ownership
    const form = await this.getFormById(input.formId)
    if (!form) {
      throw new Error('Form not found')
    }
    if (form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    // Use a transaction to ensure all operations succeed or fail together
    return await this.db.transaction(async (tx) => {
      // 1. Update form metadata if provided
      if (input.formUpdates) {
        await tx
          .update(forms)
          .set({
            ...input.formUpdates,
            openDate: input.formUpdates.openDate
              ? new Date(input.formUpdates.openDate)
              : undefined,
            closeDate: input.formUpdates.closeDate
              ? new Date(input.formUpdates.closeDate)
              : undefined
          })
          .where(eq(forms.id, input.formId))
      }

      // 2. Delete pages
      if (input.pages?.delete && input.pages.delete.length > 0) {
        for (const pageId of input.pages.delete) {
          // biome-ignore lint/nursery/noAwaitInLoop: Sequential deletes required in transaction
          await tx.delete(formPages).where(eq(formPages.id, pageId))
        }
      }

      // 3. Delete questions
      if (input.questions?.delete && input.questions.delete.length > 0) {
        for (const questionId of input.questions.delete) {
          // biome-ignore lint/nursery/noAwaitInLoop: Sequential deletes required in transaction
          await tx.delete(formQuestions).where(eq(formQuestions.id, questionId))
        }
      }

      // 4. Create new pages
      const pageIdMapping = new Map<string, string>()
      if (input.pages?.create && input.pages.create.length > 0) {
        for (const page of input.pages.create) {
          // biome-ignore lint/nursery/noAwaitInLoop: Sequential creates required to maintain order and get IDs for mapping
          const [newPage] = await tx
            .insert(formPages)
            .values({
              formId: input.formId,
              ...page
            })
            .returning()
          // Store mapping if the page had a temporary ID
          if (page.id) {
            pageIdMapping.set(page.id, newPage.id)
          }
        }
      }

      // 5. Update existing pages
      if (input.pages?.update && input.pages.update.length > 0) {
        for (const page of input.pages.update) {
          // biome-ignore lint/nursery/noAwaitInLoop: Sequential updates required in transaction
          await tx.update(formPages).set(page).where(eq(formPages.id, page.id))
        }
      }

      // 6. Create new questions (with mapped page IDs)
      if (input.questions?.create && input.questions.create.length > 0) {
        for (const question of input.questions.create) {
          // Map temporary page ID to real page ID if needed
          const realPageId =
            pageIdMapping.get(question.pageId) || question.pageId

          // biome-ignore lint/nursery/noAwaitInLoop: Sequential creates required to maintain order and use mapped page IDs
          await tx.insert(formQuestions).values({
            formId: input.formId,
            ...question,
            pageId: realPageId
          })
        }
      }

      // 7. Update existing questions
      if (input.questions?.update && input.questions.update.length > 0) {
        for (const question of input.questions.update) {
          // biome-ignore lint/nursery/noAwaitInLoop: Sequential updates required in transaction
          await tx
            .update(formQuestions)
            .set(question)
            .where(eq(formQuestions.id, question.id))
        }
      }

      // Return the complete updated form
      return await this.getFormById(input.formId)
    })
  }

  // ============================================================================
  // Page Management
  // ============================================================================

  /**
   * Create a new page
   */
  async createPage(userId: string, input: CreatePageInput) {
    // Verify form ownership
    const form = await this.getFormById(input.formId)
    if (!form) {
      throw new Error('Form not found')
    }
    if (form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    const [page] = await this.db.insert(formPages).values(input).returning()

    return page
  }

  /**
   * Update a page
   */
  async updatePage(pageId: string, userId: string, input: UpdatePageInput) {
    // Get page
    const [page] = await this.db
      .select()
      .from(formPages)
      .where(eq(formPages.id, pageId))
      .limit(1)

    if (!page) {
      throw new Error('Page not found')
    }

    // Verify form ownership
    const form = await this.getFormById(page.formId)
    if (!form || form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    const { id: _id, ...updateData } = input

    await this.db
      .update(formPages)
      .set(updateData)
      .where(eq(formPages.id, pageId))

    return { success: true }
  }

  /**
   * Delete a page (moves questions to another page)
   */
  async deletePage(pageId: string, userId: string) {
    // Get page
    const [page] = await this.db
      .select()
      .from(formPages)
      .where(eq(formPages.id, pageId))
      .limit(1)

    if (!page) {
      throw new Error('Page not found')
    }

    // Verify form ownership
    const form = await this.getFormById(page.formId)
    if (!form || form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    // Get all pages for this form
    const allPages = await this.db
      .select()
      .from(formPages)
      .where(eq(formPages.formId, page.formId))
      .orderBy(formPages.order)

    if (allPages.length <= 1) {
      throw new Error('Cannot delete the last page')
    }

    // Find target page (first page that's not the one being deleted)
    const targetPage = allPages.find((p) => p.id !== pageId)
    if (!targetPage) {
      throw new Error('No target page found')
    }

    // Move questions to target page
    await this.db
      .update(formQuestions)
      .set({ pageId: targetPage.id })
      .where(eq(formQuestions.pageId, pageId))

    // Delete the page
    await this.db.delete(formPages).where(eq(formPages.id, pageId))

    return { success: true }
  }

  /**
   * Reorder pages
   */
  async reorderPages(formId: string, userId: string, pageIds: string[]) {
    // Verify form ownership
    const form = await this.getFormById(formId)
    if (!form || form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    // Update order for each page
    await Promise.all(
      pageIds.map((pageId, index) =>
        this.db
          .update(formPages)
          .set({ order: index })
          .where(eq(formPages.id, pageId))
      )
    )

    return { success: true }
  }

  // ============================================================================
  // Question Management
  // ============================================================================

  /**
   * Create a new question
   */
  async createQuestion(userId: string, input: CreateQuestionInput) {
    // Verify form ownership
    const form = await this.getFormById(input.formId)
    if (!form || form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    const [question] = await this.db
      .insert(formQuestions)
      .values(input)
      .returning()

    return question
  }

  /**
   * Update a question
   */
  async updateQuestion(
    questionId: string,
    userId: string,
    input: UpdateQuestionInput
  ) {
    // Get question
    const [question] = await this.db
      .select()
      .from(formQuestions)
      .where(eq(formQuestions.id, questionId))
      .limit(1)

    if (!question) {
      throw new Error('Question not found')
    }

    // Verify form ownership
    const form = await this.getFormById(question.formId)
    if (!form || form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    const { id: _id, ...updateData } = input

    await this.db
      .update(formQuestions)
      .set(updateData)
      .where(eq(formQuestions.id, questionId))

    return { success: true }
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId: string, userId: string) {
    // Get question
    const [question] = await this.db
      .select()
      .from(formQuestions)
      .where(eq(formQuestions.id, questionId))
      .limit(1)

    if (!question) {
      throw new Error('Question not found')
    }

    // Verify form ownership
    const form = await this.getFormById(question.formId)
    if (!form || form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    await this.db.delete(formQuestions).where(eq(formQuestions.id, questionId))

    return { success: true }
  }

  /**
   * Reorder questions
   */
  async reorderQuestions(
    pageId: string,
    userId: string,
    questionIds: string[]
  ) {
    // Get page
    const [page] = await this.db
      .select()
      .from(formPages)
      .where(eq(formPages.id, pageId))
      .limit(1)

    if (!page) {
      throw new Error('Page not found')
    }

    // Verify form ownership
    const form = await this.getFormById(page.formId)
    if (!form || form.createdBy !== userId) {
      throw new Error('Unauthorized')
    }

    // Update order for each question
    await Promise.all(
      questionIds.map((questionId, index) =>
        this.db
          .update(formQuestions)
          .set({ order: index })
          .where(eq(formQuestions.id, questionId))
      )
    )

    return { success: true }
  }
}
