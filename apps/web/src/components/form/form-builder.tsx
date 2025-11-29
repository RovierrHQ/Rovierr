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
      onSuccess: (data) => {
        setFormData((prev) => ({ ...prev, id: data.id }))
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

    if (formData.id) {
      // Update existing form
      await updateFormMutation.mutateAsync({
        id: formData.id,
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
      await createFormMutation.mutateAsync({
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
