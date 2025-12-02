'use client'

import type { Application } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { useAppForm } from '@rov/ui/components/form/index'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { orpc } from '@/utils/orpc'

const applicationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  positionTitle: z.string().min(1, 'Position title is required'),
  jobPostUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  salaryRange: z.string().optional(),
  notes: z.string().optional()
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface EditApplicationDialogProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditApplicationDialog({
  application,
  open,
  onOpenChange
}: EditApplicationDialogProps) {
  const queryClient = useQueryClient()

  const updateMutation = useMutation(
    orpc.career.applications.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['career', 'applications', 'get', { id: application.id }]
        })
        queryClient.invalidateQueries({
          queryKey: ['career', 'applications', 'list']
        })
        queryClient.invalidateQueries({
          queryKey: ['career', 'applications', 'statistics']
        })
        toast.success('Application updated successfully')
        onOpenChange(false)
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update application')
      }
    })
  )

  const form = useAppForm({
    validators: { onSubmit: applicationSchema },
    defaultValues: {
      companyName: application.companyName,
      positionTitle: application.positionTitle,
      jobPostUrl: application.jobPostUrl || '',
      location: application.location || '',
      salaryRange: application.salaryRange || '',
      notes: application.notes || ''
    } as ApplicationFormData,
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        id: application.id,
        ...value
      })
    }
  })

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
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
              <field.Text label="Company Name" placeholder="Google" />
            )}
            name="companyName"
          />

          <form.AppField
            children={(field) => (
              <field.Text
                label="Position Title"
                placeholder="Software Engineer"
              />
            )}
            name="positionTitle"
          />

          <form.AppField
            children={(field) => (
              <field.Text
                label="Job Post URL (Optional)"
                placeholder="https://..."
                type="url"
              />
            )}
            name="jobPostUrl"
          />

          <form.AppField
            children={(field) => (
              <field.Text
                label="Location (Optional)"
                placeholder="San Francisco, CA"
              />
            )}
            name="location"
          />

          <form.AppField
            children={(field) => (
              <field.Text
                label="Salary Range (Optional)"
                placeholder="$100k - $150k"
              />
            )}
            name="salaryRange"
          />

          <form.AppField
            children={(field) => (
              <field.TextArea
                label="Notes (Optional)"
                placeholder="Add any notes about this application..."
                rows={4}
              />
            )}
            name="notes"
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
              {form.state.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
