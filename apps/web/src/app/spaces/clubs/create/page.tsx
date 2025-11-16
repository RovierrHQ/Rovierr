'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { useAppForm } from '@rov/ui/components/form/index'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { orpc } from '@/utils/orpc'

const createClubSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  tags: z.array(z.string())
})

const CreateClubPage = () => {
  const router = useRouter()
  const { mutateAsync, isPending } = useMutation(
    orpc.studentOrganizations.create.mutationOptions()
  )

  const form = useAppForm({
    validators: {
      onSubmit: createClubSchema
    },
    defaultValues: {
      name: '',
      description: '',
      tags: [] as string[]
    },
    onSubmit: async ({ value }) => {
      try {
        // Parse comma-separated tags string to array
        const tagsArray = value.tags
          ? value.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)
          : []

        const result = await mutateAsync({
          name: value.name,
          description: value.description,
          tags: tagsArray
        })

        toast.success('Club created successfully!')
        router.push(`/spaces/clubs/joined/${result.organizationId}`)
      } catch (error) {
        // Handle specific error types
        const errorMessage =
          error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : error instanceof Error
              ? error.message
              : 'Failed to create club. Please try again.'
        toast.error(errorMessage)
      }
    }
  })

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button asChild size="sm" variant="ghost">
          <Link href="/spaces/clubs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clubs
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        <h1 className="mb-6 font-semibold text-2xl sm:text-3xl">
          Create a New Club
        </h1>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.AppField
            children={(field) => (
              <field.Text label="Club Name" placeholder="Enter club name" />
            )}
            name="name"
          />

          <form.AppField
            children={(field) => (
              <field.TextArea
                label="Description"
                placeholder="Describe what your club is about"
                rows={4}
              />
            )}
            name="description"
          />

          <form.AppField
            children={(field) => (
              <field.Text
                label="Tags"
                placeholder="e.g., Technology, Arts, Sports (comma-separated)"
              />
            )}
            name="tags"
          />

          <div className="flex gap-4">
            <Button
              className="flex-1"
              disabled={form.state.isSubmitting || isPending}
              type="submit"
            >
              {form.state.isSubmitting || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Club'
              )}
            </Button>
            <Button
              disabled={form.state.isSubmitting || isPending}
              onClick={() => router.back()}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateClubPage
