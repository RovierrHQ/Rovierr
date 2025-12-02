'use client'

import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
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

interface ApplicationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ApplicationForm({ onSuccess, onCancel }: ApplicationFormProps) {
  const queryClient = useQueryClient()
  const [isParsing, setIsParsing] = useState(false)
  const [urlToParse, setUrlToParse] = useState('')

  const createMutation = useMutation(
    orpc.career.applications.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['career', 'applications', 'list']
        })
        queryClient.invalidateQueries({
          queryKey: ['career', 'applications', 'statistics']
        })
        toast.success('Application added successfully')
        onSuccess?.()
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to add application')
      }
    })
  )

  const form = useAppForm({
    validators: { onSubmit: applicationSchema },
    defaultValues: {
      companyName: '',
      positionTitle: '',
      jobPostUrl: '',
      location: '',
      salaryRange: '',
      notes: ''
    } as ApplicationFormData,
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value)
    }
  })

  // Handle URL parsing
  const handleParseUrl = async () => {
    if (!urlToParse) {
      toast.error('Please enter a job post URL')
      return
    }

    setIsParsing(true)
    try {
      const result = await orpc.career.applications.parseUrl.call({
        url: urlToParse
      })

      // Pre-fill form fields with parsed data
      if (result.companyName) {
        form.setFieldValue('companyName', result.companyName)
      }
      if (result.positionTitle) {
        form.setFieldValue('positionTitle', result.positionTitle)
      }
      if (result.location) {
        form.setFieldValue('location', result.location)
      }
      if (result.salaryRange) {
        form.setFieldValue('salaryRange', result.salaryRange)
      }
      form.setFieldValue('jobPostUrl', urlToParse)

      toast.success('Job information extracted successfully!')
    } catch {
      toast.error(
        'Failed to parse job post. You can still fill in the details manually.'
      )
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      {/* AI-Powered URL Parsing */}
      <div className="rounded-lg border border-chart-1/20 bg-chart-1/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-chart-1" />
          <h3 className="font-semibold text-chart-1">
            AI-Powered Job Post Parser
          </h3>
        </div>
        <p className="mb-4 text-muted-foreground text-sm">
          Paste a job post URL and we'll automatically extract the details for
          you
        </p>
        <div className="flex gap-2">
          <input
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isParsing}
            onChange={(e) => setUrlToParse(e.target.value)}
            placeholder="https://example.com/job-posting"
            type="url"
            value={urlToParse}
          />
          <Button
            className="gap-2"
            disabled={isParsing || !urlToParse}
            onClick={handleParseUrl}
            type="button"
          >
            {isParsing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Parse
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Manual Form Fields */}
      <form.AppField
        children={(field) => (
          <field.Text
            description="The name of the company you're applying to"
            label="Company Name"
            placeholder="e.g., Google, Meta, Stripe"
          />
        )}
        name="companyName"
      />

      <form.AppField
        children={(field) => (
          <field.Text
            description="The job title or position name"
            label="Position Title"
            placeholder="e.g., Software Engineer, Product Manager"
          />
        )}
        name="positionTitle"
      />

      <form.AppField
        children={(field) => (
          <field.Text
            description="Link to the original job posting"
            label="Job Post URL (Optional)"
            placeholder="https://example.com/job-posting"
            type="url"
          />
        )}
        name="jobPostUrl"
      />

      <form.AppField
        children={(field) => (
          <field.Text
            description="Where the job is located"
            label="Location (Optional)"
            placeholder="e.g., San Francisco, CA or Remote"
          />
        )}
        name="location"
      />

      <form.AppField
        children={(field) => (
          <field.Text
            description="Expected salary range if mentioned"
            label="Salary Range (Optional)"
            placeholder="e.g., $80k-$120k, £50,000-£70,000"
          />
        )}
        name="salaryRange"
      />

      <form.AppField
        children={(field) => (
          <field.TextArea
            description="Any additional information or reminders"
            label="Notes (Optional)"
            placeholder="Add any additional notes about this application..."
            rows={4}
          />
        )}
        name="notes"
      />

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            disabled={form.state.isSubmitting}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        )}
        <Button disabled={form.state.isSubmitting} type="submit">
          {form.state.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Application'
          )}
        </Button>
      </div>
    </form>
  )
}
