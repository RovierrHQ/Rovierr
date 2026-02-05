'use client'

import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { useAppForm } from '@rov/ui/components/form/index'
import api, { useMutation, useQueryClient } from '@web/lib/api-client'
import { toast } from 'sonner'
import { z } from 'zod'

const createThreadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(10_000),
  type: z.enum(['question', 'announcement', 'discussion']),
  isAnonymous: z.boolean(),
  tags: z.array(z.string()).max(5).optional()
})

type CreateThreadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contextType: 'course' | 'society' | 'event' | 'project'
  contextId: string
}

export function CreateThreadDialog({
  open,
  onOpenChange,
  contextType,
  contextId
}: CreateThreadDialogProps) {
  const queryClient = useQueryClient()

  const createMutation = useMutation(
    (data: {
      title: string
      content: string
      type: 'question' | 'announcement' | 'discussion'
      isAnonymous: boolean
      tags?: string[]
      contextType: 'course' | 'society' | 'event' | 'project'
      contextId: string
    }) => api.discussion.thread.create.post(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['discussion', 'thread', 'list', contextType, contextId]
        })
        toast.success('Discussion created successfully')
        onOpenChange(false)
        form.reset()
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create discussion'
        )
      }
    }
  )

  const form = useAppForm({
    validators: { onSubmit: createThreadSchema },
    defaultValues: {
      title: '',
      content: '',
      type: 'question',
      isAnonymous: false,
      tags: []
    } as z.infer<typeof createThreadSchema>,
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        ...value,
        contextType,
        contextId
      })
    }
  })

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Discussion</DialogTitle>
          <DialogDescription>
            Start a new discussion, ask a question, or make an announcement
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.AppField
            children={(field) => (
              <field.Text
                label="Title"
                placeholder="What's your discussion about?"
              />
            )}
            name="title"
          />

          <form.AppField
            children={(field) => (
              <field.Select
                label="Type"
                options={[
                  { label: 'Question', value: 'question' },
                  { label: 'Discussion', value: 'discussion' },
                  { label: 'Announcement', value: 'announcement' }
                ]}
                placeholder="Select discussion type"
              />
            )}
            name="type"
          />

          <form.AppField
            children={(field) => (
              <field.TextArea
                label="Content"
                placeholder="Provide details about your discussion..."
                rows={6}
              />
            )}
            name="content"
          />

          <form.AppField
            children={(field) => <field.Checkbox label="Post anonymously" />}
            name="isAnonymous"
          />

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={form.state.isSubmitting} type="submit">
              {form.state.isSubmitting ? 'Creating...' : 'Create Discussion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
