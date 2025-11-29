'use client'

import { createSocietySchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { useAppForm } from '@rov/ui/components/form/index'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import type { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

const CreateClubPage = () => {
  const router = useRouter()
  const { data: universities } = useQuery(orpc.university.list.queryOptions())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useAppForm({
    validators: {
      onSubmit: createSocietySchema
    },
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      type: 'student' as 'student' | 'university',
      institutionId: '',
      visibility: 'public',
      tags: [],
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      whatsapp: '',
      telegram: '',
      website: ''
    } as z.infer<typeof createSocietySchema>,
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true)

        // Generate slug from name if not provided
        const slug =
          value.slug ||
          value.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        // Create organization using Better Auth client with additional fields
        const result = await authClient.organization.create({
          name: value.name,
          slug,
          // Additional fields for society
          description: value.description,
          institutionId: value.institutionId || undefined,
          type: value.type,
          visibility: value.visibility,
          tags: value.tags,
          // Social links
          instagram: value.instagram || undefined,
          facebook: value.facebook || undefined,
          twitter: value.twitter || undefined,
          linkedin: value.linkedin || undefined,
          whatsapp: value.whatsapp || undefined,
          telegram: value.telegram || undefined,
          website: value.website || undefined
        })

        if (!result?.data?.id) {
          throw new Error('Failed to create organization')
        }

        toast.success('Society created successfully!')
        // Redirect to onboarding
        router.push(`/spaces/societies/mine/${result.data.id}/onboarding`)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create society. Please try again.'
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
          <Link href="/spaces/societies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Societies
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        <h1 className="mb-6 font-semibold text-2xl sm:text-3xl">
          Create a New Society
        </h1>

        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Basic Information</h2>

            <form.AppField
              children={(field) => (
                <field.Text
                  label="Society Name"
                  placeholder="Enter society name"
                />
              )}
              name="name"
            />

            <form.AppField
              children={(field) => (
                <field.TextArea
                  label="Description"
                  placeholder="Describe what your society is about"
                  rows={4}
                />
              )}
              name="description"
            />

            <form.AppField
              children={(field) => (
                <field.Select
                  label="Organization Type"
                  options={[
                    {
                      label: 'Student Society',
                      value: 'student'
                    },
                    {
                      label: 'University Official Organization',
                      value: 'university'
                    }
                  ]}
                  placeholder="Select organization type"
                />
              )}
              name="type"
            />

            <form.AppField
              children={(field) => (
                <div className="space-y-2">
                  <field.Select
                    label="University Affiliation"
                    options={
                      universities?.universities?.map((uni) => ({
                        label: `${uni.name} - ${uni.city}, ${uni.country}`,
                        value: uni.id
                      })) ?? []
                    }
                    placeholder="Select university"
                  />
                  <p className="text-muted-foreground text-sm">
                    {form.state.values.type === 'university'
                      ? 'Required for university organizations'
                      : 'Optional for student societies'}
                  </p>
                </div>
              )}
              name="institutionId"
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
          </div>

          {/* Social Links Section */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Social Links (Optional)</h2>
            <p className="text-muted-foreground text-sm">
              Add your society's social media profiles to help members connect
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.AppField
                children={(field) => (
                  <field.Text
                    label="Instagram"
                    placeholder="@username or profile URL"
                  />
                )}
                name="instagram"
              />

              <form.AppField
                children={(field) => (
                  <field.Text
                    label="Facebook"
                    placeholder="https://facebook.com/..."
                  />
                )}
                name="facebook"
              />

              <form.AppField
                children={(field) => (
                  <field.Text label="Twitter/X" placeholder="@username" />
                )}
                name="twitter"
              />

              <form.AppField
                children={(field) => (
                  <field.Text
                    label="LinkedIn"
                    placeholder="https://linkedin.com/..."
                  />
                )}
                name="linkedin"
              />

              <form.AppField
                children={(field) => (
                  <field.Text
                    label="WhatsApp"
                    placeholder="Phone or group link"
                  />
                )}
                name="whatsapp"
              />

              <form.AppField
                children={(field) => (
                  <field.Text
                    label="Telegram"
                    placeholder="@username or group link"
                  />
                )}
                name="telegram"
              />

              <form.AppField
                children={(field) => (
                  <field.Text
                    label="Website"
                    placeholder="https://yourwebsite.com"
                  />
                )}
                name="website"
              />
            </div>
          </div>

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
                'Create Society'
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
