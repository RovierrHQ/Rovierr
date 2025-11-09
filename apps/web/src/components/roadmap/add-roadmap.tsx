import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { Textarea } from '@rov/ui/components/textarea'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { zodV4Resolver } from '@/lib/zod-v4-resolver'
import { orpc } from '@/utils/orpc'

const roadmapSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long'),
  category: z.enum(['feature-request', 'bug-report', 'improvement'])
})

type RoadmapFormData = z.infer<typeof roadmapSchema>

const AddRoadmap = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: session } = authClient.useSession()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<RoadmapFormData>({
    resolver: zodV4Resolver(roadmapSchema),
    defaultValues: {
      title: '',
      description: ''
    }
  })

  const queryClient = useQueryClient()

  const onSubmit = async (data: RoadmapFormData) => {
    try {
      if (!session?.user.id) return

      setLoading(true)

      await queryClient.fetchQuery(
        orpc.roadmap.add.queryOptions({
          input: {
            ...data,
            status: 'preview'
          }
        })
      )

      await queryClient.fetchQuery(
        orpc.roadmap.list.queryOptions({
          input: {
            query: {}
          }
        })
      )

      toast.success('Roadmap request submitted successfully!')
      setOpen(false)
      reset()
    } catch {
      toast.error('Failed to submit roadmap request.')
    } finally {
      setLoading(false)
    }
  }

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

          <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label className="mb-1 font-medium text-foreground text-sm">
                Category
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue('category', value as RoadmapFormData['category'], {
                    shouldValidate: true
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature-request">
                    Feature Request
                  </SelectItem>
                  <SelectItem value="bug-report">Bug Report</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1 font-medium text-foreground text-sm">
                Title
              </Label>
              <Input
                {...register('title')}
                placeholder="Short title for your idea"
              />
              {errors.title && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1 font-medium text-foreground text-sm">
                Description
              </Label>
              <Textarea
                {...register('description')}
                placeholder="Describe your idea in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                disabled={loading}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>

              <Button disabled={loading} type="submit" variant="default">
                {loading ? (
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
