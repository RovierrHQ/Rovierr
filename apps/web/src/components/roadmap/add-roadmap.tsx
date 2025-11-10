import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { useAppForm } from '@rov/ui/components/form/index'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { orpc, queryClient } from '@/utils/orpc'

const roadmapSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long'),
  category: z.enum(['feature-request', 'bug-report', 'improvement'])
})

const AddRoadmap = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const { data: session } = authClient.useSession()
  const { mutateAsync } = useMutation(
    orpc.roadmap.add.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.roadmap.list.key()
        })
      }
    })
  )
  const form = useAppForm({
    validators: {
      onSubmit: roadmapSchema
    },
    defaultValues: {
      title: '',
      description: '',
      category: 'feature-request' as
        | 'feature-request'
        | 'bug-report'
        | 'improvement'
    },
    onSubmit: async ({ value }) => {
      try {
        if (!session?.user.id) return

        await mutateAsync({
          ...value,
          status: 'preview'
        })

        toast.success('Roadmap request submitted successfully!')
        setOpen(false)
        form.reset()
      } catch {
        toast.error('Failed to submit roadmap request.')
      }
    }
  })

  return (
    <div>
      <div
        onClick={() => (session?.user.id ? setOpen(true) : redirect('/login'))}
      >
        {children}
      </div>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit a Feature Request</DialogTitle>
            <DialogDescription>
              Tell us what feature, improvement, or bug fix you’d like to
              suggest.
            </DialogDescription>
          </DialogHeader>

          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.AppField
              children={(field) => (
                <field.Select
                  label="Category"
                  options={['feature-request', 'bug-report', 'improvement']}
                  placeholder="Select category"
                />
              )}
              name="category"
            />

            <form.AppField
              children={(field) => (
                <field.Text
                  label="title"
                  placeholder="Short title for your idea"
                />
              )}
              name="title"
            />
            <form.AppField
              children={(field) => (
                <field.TextArea
                  label="Description"
                  placeholder="Describe your idea in detail..."
                />
              )}
              name="description"
            />

            <DialogFooter className="pt-4">
              <Button
                disabled={form.state.isSubmitting}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>

              <Button
                disabled={form.state.isSubmitting}
                type="submit"
                variant="default"
              >
                {form.state.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddRoadmap
