'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { useAppForm } from '@rov/ui/components/form/index'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

const createClubSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().min(1, 'Description is required').max(1000),
    type: z.enum(['student', 'university']),
    universityId: z.string().optional(),
    tags: z.array(z.string())
  })
  .refine(
    (data) => {
      // University organizations must be linked to a university
      if (data.type === 'university') {
        return !!data.universityId && data.universityId.length > 0
      }
      // Student clubs can optionally be affiliated with a university
      return true
    },
    {
      message:
        'University selection is required for university official organizations',
      path: ['universityId']
    }
  )

const CreateClubPage = () => {
  const router = useRouter()
  const { data: universities } = useQuery(orpc.university.list.queryOptions())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useAppForm({
    validators: {
      onSubmit: createClubSchema
    },
    defaultValues: {
      name: '',
      description: '',
      type: 'student' as 'student' | 'university',
      universityId: '',
      tags: [] as string[]
    } as z.infer<typeof createClubSchema>,
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true)

        // Generate slug from name
        const slug = value.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

        // Create organization using Better Auth client
        const result = await authClient.organization.create({
          name: value.name,
          slug,
          type: value.type,
          universityId: value.universityId || undefined,
          description: value.description,
          tags: value.tags
        })

        if (!result?.data?.id) {
          throw new Error('Failed to create organization')
        }

        toast.success('Club created successfully!')
        router.push(`/spaces/clubs/joined/${result.data.id}`)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create club. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsSubmitting(false)
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
              <field.Switch
                checked={field.state.value === 'university'}
                label="University Official Organization"
                onCheckedChange={(checked) => {
                  field.handleChange(checked ? 'university' : 'student')
                }}
              />
            )}
            name="type"
          />

          <form.AppField
            children={(field) => (
              <field.Select
                label="University Affiliation (Optional)"
                options={
                  universities?.universities?.map((uni) => ({
                    label: `${uni.name} - ${uni.city}, ${uni.country}`,
                    value: uni.id
                  })) ?? []
                }
                placeholder="Select if affiliated with a university"
              />
            )}
            name="universityId"
          />

          <form.AppField
            children={(field) => (
              <field.TagInput
                label="Tags"
                placeholder="Type a tag and press Enter"
              />
            )}
            name="tags"
          />

          <div className="flex gap-4">
            <Button
              className="flex-1"
              disabled={form.state.isSubmitting || isSubmitting}
              type="submit"
            >
              {form.state.isSubmitting || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Club'
              )}
            </Button>
            <Button
              disabled={form.state.isSubmitting || isSubmitting}
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
