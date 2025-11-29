'use client'

import type {
  ConditionOperator,
  QuestionType,
  ValidationRule
} from '@rov/shared'
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

export interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  options?: string[]
  placeholder?: string
  pageId: string
  order: number
  conditionalLogicEnabled: boolean
  sourceQuestionId?: string
  condition?: ConditionOperator
  conditionValue?: string
  validationRules?: ValidationRule
  profileFieldKey?: string
  enableAutoFill: boolean
  enableBidirectionalSync: boolean
  acceptedFileTypes?: string[]
  maxFileSize?: number
}

export interface Page {
  id: string
  title: string
  description?: string
  order: number
  conditionalLogicEnabled: boolean
  sourceQuestionId?: string
  condition?: ConditionOperator
  conditionValue?: string
}

export interface FormData {
  id?: string
  title: string
  description?: string
  entityType: 'society' | 'event' | 'survey'
  entityId: string
  status: 'draft' | 'published' | 'closed' | 'archived'
  allowMultipleSubmissions: boolean
  requireAuthentication: boolean
  openDate?: string
  closeDate?: string
  maxResponses?: number
  paymentEnabled: boolean
  paymentAmount?: string
  notificationsEnabled: boolean
  notificationEmails?: string[]
  confirmationMessage?: string
  confirmationEmailEnabled: boolean
  confirmationEmailContent?: string
  pages: Page[]
  questions: Question[]
}

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

  const [formData, setFormData] = useState<FormData>({
    title: 'Untitled Form',
    description: '',
    entityType,
    entityId,
    status: 'draft',
    allowMultipleSubmissions: false,
    requireAuthentication: true,
    paymentEnabled: false,
    notificationsEnabled: false,
    confirmationEmailEnabled: false,
    pages: [
      {
        id: 'temp-page-1',
        title: 'Page 1',
        order: 0,
        conditionalLogicEnabled: false
      }
    ],
    questions: []
  })

  // Update form data when existing form is loaded
  useEffect(() => {
    if (existingForm) {
      setFormData({
        id: existingForm.id,
        title: existingForm.title,
        description: existingForm.description || '',
        entityType: existingForm.entityType,
        entityId: existingForm.entityId,
        status: existingForm.status,
        allowMultipleSubmissions: Boolean(
          existingForm.allowMultipleSubmissions
        ),
        requireAuthentication: Boolean(existingForm.requireAuthentication),
        openDate: existingForm.openDate || undefined,
        closeDate: existingForm.closeDate || undefined,
        maxResponses: existingForm.maxResponses || undefined,
        paymentEnabled: Boolean(existingForm.paymentEnabled),
        paymentAmount: existingForm.paymentAmount || undefined,
        notificationsEnabled: Boolean(existingForm.notificationsEnabled),
        notificationEmails: existingForm.notificationEmails || undefined,
        confirmationMessage: existingForm.confirmationMessage || undefined,
        confirmationEmailEnabled: Boolean(
          existingForm.confirmationEmailEnabled
        ),
        confirmationEmailContent:
          existingForm.confirmationEmailContent || undefined,
        pages: existingForm.pages.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description || undefined,
          order: p.order,
          conditionalLogicEnabled: Boolean(p.conditionalLogicEnabled),
          sourceQuestionId: p.sourceQuestionId || undefined,
          condition: (p.condition as ConditionOperator) || undefined,
          conditionValue: p.conditionValue || undefined
        })),
        questions: existingForm.questions.map((q) => ({
          id: q.id,
          type: q.type,
          title: q.title,
          description: q.description || undefined,
          required: Boolean(q.required),
          options: q.options || undefined,
          placeholder: q.placeholder || undefined,
          pageId: q.pageId,
          order: q.order,
          conditionalLogicEnabled: Boolean(q.conditionalLogicEnabled),
          sourceQuestionId: q.sourceQuestionId || undefined,
          condition: (q.condition as ConditionOperator) || undefined,
          conditionValue: q.conditionValue || undefined,
          validationRules: q.validationRules || undefined,
          profileFieldKey: q.profileFieldKey || undefined,
          enableAutoFill: Boolean(q.enableAutoFill),
          enableBidirectionalSync: Boolean(q.enableBidirectionalSync),
          acceptedFileTypes: q.acceptedFileTypes || undefined,
          maxFileSize: q.maxFileSize || undefined
        }))
      })
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
    if (formData.id) {
      // Update existing form
      await updateFormMutation.mutateAsync({
        id: formData.id,
        title: formData.title,
        description: formData.description,
        allowMultipleSubmissions: formData.allowMultipleSubmissions,
        requireAuthentication: formData.requireAuthentication,
        openDate: formData.openDate,
        closeDate: formData.closeDate,
        maxResponses: formData.maxResponses,
        paymentEnabled: formData.paymentEnabled,
        paymentAmount: formData.paymentAmount,
        notificationsEnabled: formData.notificationsEnabled,
        notificationEmails: formData.notificationEmails,
        confirmationMessage: formData.confirmationMessage,
        confirmationEmailEnabled: formData.confirmationEmailEnabled,
        confirmationEmailContent: formData.confirmationEmailContent
      })
    } else {
      // Create new form
      await createFormMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        entityType: formData.entityType,
        entityId: formData.entityId,
        allowMultipleSubmissions: formData.allowMultipleSubmissions,
        requireAuthentication: formData.requireAuthentication,
        openDate: formData.openDate,
        closeDate: formData.closeDate,
        maxResponses: formData.maxResponses,
        paymentEnabled: formData.paymentEnabled,
        paymentAmount: formData.paymentAmount,
        notificationsEnabled: formData.notificationsEnabled,
        notificationEmails: formData.notificationEmails,
        confirmationMessage: formData.confirmationMessage,
        confirmationEmailEnabled: formData.confirmationEmailEnabled,
        confirmationEmailContent: formData.confirmationEmailContent
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
            formData={formData}
            selectedQuestionId={selectedQuestionId}
            setFormData={setFormData}
            setSelectedQuestionId={setSelectedQuestionId}
          />
        </TabsContent>

        <TabsContent value="preview">
          <FormPreview formData={formData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
