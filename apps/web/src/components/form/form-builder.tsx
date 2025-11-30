'use client'

import { Button } from '@rov/ui/components/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, FileText, Loader2, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import { FormEditor } from './form-editor'
import { FormPreview } from './form-preview'

// Export types directly from the consolidated schemas
export type {
  FullForm as FormData,
  FullForm
} from '@rov/orpc-contracts/form/schemas'

// Derive types from FullForm
import type { FullForm } from '@rov/orpc-contracts/form/schemas'
export type Page = FullForm['pages'][number]
export type Question = FullForm['questions'][number]

// Use the API type directly
type FormData = FullForm

interface FormBuilderProps {
  formId?: string
  entityType: 'society' | 'event' | 'survey'
  entityId: string
}

export default function FormBuilder({
  formId,
  entityType,
  entityId
}: FormBuilderProps) {
  const queryClient = useQueryClient()
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  )

  // Track deleted pages and questions for database cleanup
  const [deletedPageIds, setDeletedPageIds] = useState<string[]>([])
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([])

  // Fetch existing form if formId is provided
  const { data: existingForm, isLoading } = useQuery({
    ...orpc.form.get.queryOptions({ input: { id: formId || '' } }),
    enabled: !!formId
  })

  const [formData, setFormData] = useState<Partial<FormData>>({
    title: 'Untitled Form',
    description: null,
    entityType,
    entityId,
    status: 'draft',
    allowMultipleSubmissions: false,
    requireAuthentication: true,
    openDate: null,
    closeDate: null,
    maxResponses: null,
    paymentEnabled: false,
    paymentAmount: null,
    notificationsEnabled: false,
    notificationEmails: null,
    confirmationMessage: null,
    confirmationEmailEnabled: false,
    confirmationEmailContent: null,
    pages: [
      {
        id: 'temp-page-1',
        title: 'Page 1',
        description: null,
        order: 0,
        conditionalLogicEnabled: false,
        sourceQuestionId: null,
        condition: null,
        conditionValue: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        formId: ''
      }
    ],
    questions: []
  })

  // Update form data when existing form is loaded
  useEffect(() => {
    if (existingForm) {
      setFormData(existingForm)
    }
  }, [existingForm])

  // Create form mutation
  const createFormMutation = useMutation(
    orpc.form.create.mutationOptions({
      onSuccess: async (data) => {
        // Fetch the complete form with pages to get real page IDs
        const completeForm = await orpc.form.get.call({ id: data.id })
        setFormData(completeForm)
        queryClient.invalidateQueries({ queryKey: ['form', 'list'] })
        toast.success('Form created successfully')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create form')
      }
    })
  )

  // Update form mutation
  const updateFormMutation = useMutation(
    orpc.form.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['form', formData.id] })
        toast.success('Form saved successfully')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to save form')
      }
    })
  )

  // Publish form mutation
  const publishFormMutation = useMutation(
    orpc.form.publish.mutationOptions({
      onSuccess: () => {
        setFormData((prev) => ({ ...prev, status: 'published' }))
        queryClient.invalidateQueries({ queryKey: ['form', formData.id] })
        toast.success('Form published successfully')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to publish form')
      }
    })
  )

  const handleSave = async () => {
    try {
      // Helper to convert null to undefined for mutations
      const nullToUndefined = <T,>(value: T | null): T | undefined =>
        value === null ? undefined : value

      // Helper to convert string dates to Date objects
      const stringToDate = (
        value: string | null | undefined
      ): Date | null | undefined => {
        if (!value) return value === null ? null : undefined
        return new Date(value)
      }

      let currentFormId = formData.id

      // Step 1: Save form metadata
      if (currentFormId) {
        // Update existing form
        await updateFormMutation.mutateAsync({
          id: currentFormId,
          title: formData.title,
          description: nullToUndefined(formData.description),
          allowMultipleSubmissions: formData.allowMultipleSubmissions,
          requireAuthentication: formData.requireAuthentication,
          openDate: stringToDate(formData.openDate),
          closeDate: stringToDate(formData.closeDate),
          maxResponses: nullToUndefined(formData.maxResponses),
          paymentEnabled: formData.paymentEnabled,
          paymentAmount: nullToUndefined(formData.paymentAmount),
          notificationsEnabled: formData.notificationsEnabled,
          notificationEmails: nullToUndefined(formData.notificationEmails),
          confirmationMessage: nullToUndefined(formData.confirmationMessage),
          confirmationEmailEnabled: formData.confirmationEmailEnabled,
          confirmationEmailContent: nullToUndefined(
            formData.confirmationEmailContent
          )
        })
      } else {
        // Create new form
        const newForm = await createFormMutation.mutateAsync({
          title: formData.title || '',
          description: nullToUndefined(formData.description),
          entityType: formData.entityType || 'society',
          entityId: formData.entityId || '',
          allowMultipleSubmissions: formData.allowMultipleSubmissions,
          requireAuthentication: formData.requireAuthentication,
          openDate: stringToDate(formData.openDate),
          closeDate: stringToDate(formData.closeDate),
          maxResponses: nullToUndefined(formData.maxResponses),
          paymentEnabled: formData.paymentEnabled,
          paymentAmount: nullToUndefined(formData.paymentAmount),
          notificationsEnabled: formData.notificationsEnabled,
          notificationEmails: nullToUndefined(formData.notificationEmails),
          confirmationMessage: nullToUndefined(formData.confirmationMessage),
          confirmationEmailEnabled: formData.confirmationEmailEnabled,
          confirmationEmailContent: nullToUndefined(
            formData.confirmationEmailContent
          )
        })
        currentFormId = newForm.id
        setFormData((prev) => ({ ...prev, id: currentFormId }))
      }

      // Step 2: Delete removed pages
      for (const pageId of deletedPageIds) {
        // Only delete if it's a real ID (not temporary)
        if (!(pageId.startsWith('temp-') || pageId.startsWith('page-'))) {
          try {
            // biome-ignore lint/nursery/noAwaitInLoop: Sequential deletes required for proper cleanup
            await orpc.form.page.delete.call({ id: pageId })
          } catch (_error) {
            // Continue with other operations even if delete fails
          }
        }
      }
      setDeletedPageIds([]) // Clear after deletion

      // Step 3: Delete removed questions
      for (const questionId of deletedQuestionIds) {
        // Only delete if it's a real ID (not temporary)
        if (!questionId.startsWith('q-')) {
          try {
            // biome-ignore lint/nursery/noAwaitInLoop: Sequential deletes required for proper cleanup
            await orpc.form.question.delete.call({ id: questionId })
          } catch (_error) {
            // Continue with other operations even if delete fails
          }
        }
      }
      setDeletedQuestionIds([]) // Clear after deletion

      // Step 4: Save pages
      const pageIdMapping = new Map<string, string>() // temp ID -> real ID

      // Sequential saves required to maintain order and dependencies
      for (const page of formData.pages || []) {
        const isTemporaryId =
          page.id.startsWith('temp-') || page.id.startsWith('page-')

        if (isTemporaryId) {
          // Create new page
          // biome-ignore lint/nursery/noAwaitInLoop: Sequential saves required to maintain order and get IDs for mapping
          const result = await orpc.form.page.create.call({
            formId: currentFormId,
            title: page.title,
            description: nullToUndefined(page.description),
            order: page.order,
            conditionalLogicEnabled: page.conditionalLogicEnabled,
            sourceQuestionId: nullToUndefined(page.sourceQuestionId),
            condition: nullToUndefined(page.condition),
            conditionValue: nullToUndefined(page.conditionValue)
          })
          pageIdMapping.set(page.id, result.id)
        } else {
          // Update existing page
          await orpc.form.page.update.call({
            id: page.id,
            title: page.title,
            description: nullToUndefined(page.description),
            order: page.order,
            conditionalLogicEnabled: page.conditionalLogicEnabled,
            sourceQuestionId: nullToUndefined(page.sourceQuestionId),
            condition: nullToUndefined(page.condition),
            conditionValue: nullToUndefined(page.conditionValue)
          })
        }
      }

      // Step 5: Save questions
      const questionIdMapping = new Map<string, string>() // temp ID -> real ID

      // Sequential saves required to maintain order and page dependencies
      for (const question of formData.questions || []) {
        const isTemporaryId = question.id.startsWith('q-')
        const realPageId = pageIdMapping.get(question.pageId) || question.pageId

        if (isTemporaryId) {
          // Create new question
          // biome-ignore lint/nursery/noAwaitInLoop: Sequential saves required to maintain order and use mapped page IDs
          const result = await orpc.form.question.create.call({
            formId: currentFormId,
            pageId: realPageId,
            type: question.type,
            title: question.title,
            description: nullToUndefined(question.description),
            placeholder: nullToUndefined(question.placeholder),
            required: question.required,
            order: question.order,
            options: nullToUndefined(question.options),
            validationRules: nullToUndefined(question.validationRules),
            conditionalLogicEnabled: question.conditionalLogicEnabled,
            sourceQuestionId: nullToUndefined(question.sourceQuestionId),
            condition: nullToUndefined(question.condition),
            conditionValue: nullToUndefined(question.conditionValue),
            profileFieldKey: nullToUndefined(question.profileFieldKey),
            enableAutoFill: question.enableAutoFill,
            enableBidirectionalSync: question.enableBidirectionalSync,
            acceptedFileTypes: nullToUndefined(question.acceptedFileTypes),
            maxFileSize: nullToUndefined(question.maxFileSize)
          })
          questionIdMapping.set(question.id, result.id)
        } else {
          // Update existing question
          await orpc.form.question.update.call({
            id: question.id,
            type: question.type,
            title: question.title,
            description: nullToUndefined(question.description),
            placeholder: nullToUndefined(question.placeholder),
            required: question.required,
            order: question.order,
            options: nullToUndefined(question.options),
            validationRules: nullToUndefined(question.validationRules),
            conditionalLogicEnabled: question.conditionalLogicEnabled,
            sourceQuestionId: nullToUndefined(question.sourceQuestionId),
            condition: nullToUndefined(question.condition),
            conditionValue: nullToUndefined(question.conditionValue),
            profileFieldKey: nullToUndefined(question.profileFieldKey),
            enableAutoFill: question.enableAutoFill,
            enableBidirectionalSync: question.enableBidirectionalSync,
            acceptedFileTypes: nullToUndefined(question.acceptedFileTypes),
            maxFileSize: nullToUndefined(question.maxFileSize)
          })
        }
      }

      // Step 6: Update local state with real IDs
      if (pageIdMapping.size > 0 || questionIdMapping.size > 0) {
        setFormData((prev) => ({
          ...prev,
          pages: (prev.pages || []).map((p) => ({
            ...p,
            id: pageIdMapping.get(p.id) || p.id,
            formId: currentFormId
          })),
          questions: (prev.questions || []).map((q) => ({
            ...q,
            id: questionIdMapping.get(q.id) || q.id,
            pageId: pageIdMapping.get(q.pageId) || q.pageId,
            formId: currentFormId
          }))
        }))
      }

      // Step 5: Reorder pages if needed
      const finalPageIds = (formData.pages || []).map(
        (p) => pageIdMapping.get(p.id) || p.id
      )
      if (finalPageIds.length > 0) {
        await orpc.form.page.reorder.call({
          formId: currentFormId,
          pageIds: finalPageIds
        })
      }

      // Step 6: Refetch the complete form to get all real IDs
      const updatedForm = await orpc.form.get.call({ id: currentFormId })
      setFormData(updatedForm)

      toast.success('Form saved successfully!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save form'
      )
    }
  }

  const handlePublish = async () => {
    if (!formData.id) {
      toast.error('Please save the form before publishing')
      return
    }

    await publishFormMutation.mutateAsync({ id: formData.id })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{formData.title}</h1>
              <p className="text-muted-foreground text-xs">
                {formData.status === 'published' ? 'Published' : 'Draft'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={
                createFormMutation.isPending || updateFormMutation.isPending
              }
              onClick={handleSave}
              size="sm"
              variant="outline"
            >
              {createFormMutation.isPending || updateFormMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
            <Button
              disabled={
                publishFormMutation.isPending || formData.status === 'published'
              }
              onClick={handlePublish}
              size="sm"
            >
              {publishFormMutation.isPending && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              )}
              {!publishFormMutation.isPending &&
                formData.status === 'published' &&
                'Published'}
              {!publishFormMutation.isPending &&
                formData.status !== 'published' &&
                'Publish'}
            </Button>
          </div>
        </div>
      </header>

      <Tabs className="container py-6" defaultValue="build">
        <TabsList className="mb-6">
          <TabsTrigger className="gap-2" value="build">
            <Settings className="h-4 w-4" />
            Build
          </TabsTrigger>
          <TabsTrigger className="gap-2" value="preview">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="build">
          <FormEditor
            formData={formData as FormData}
            selectedQuestionId={selectedQuestionId}
            setFormData={setFormData}
            setSelectedQuestionId={setSelectedQuestionId}
          />
        </TabsContent>

        <TabsContent value="preview">
          <FormPreview formData={formData as FormData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
