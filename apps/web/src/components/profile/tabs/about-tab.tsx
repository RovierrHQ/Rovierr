'use client'

import { aboutUpdateSchema } from '@rov/orpc-contracts/user/profile-schemas'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { useAppForm } from '@rov/ui/components/form/index'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Edit,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MessageSquare,
  Save,
  Twitter,
  X
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { z } from 'zod'
import { orpc } from '@/utils/orpc'

export function AboutTab() {
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()

  const { data: profileDetails, isLoading } = useQuery(
    orpc.user.profile.details.queryOptions()
  )

  const form = useAppForm({
    validators: { onSubmit: aboutUpdateSchema },
    defaultValues: {
      bio: '',
      website: '',
      whatsapp: '',
      telegram: '',
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: ''
    } as z.infer<typeof aboutUpdateSchema>,
    onSubmit: async ({ value }) => {
      try {
        await orpc.user.profile.update.call(value)
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
        setIsEditing(false)
        toast.success('Profile updated successfully')
      } catch (error) {
        toast.error((error as Error).message || 'Failed to update profile')
      }
    }
  })

  // Update form data when profile loads or when entering edit mode
  const handleEditClick = () => {
    if (profileDetails) {
      form.setFieldValue('bio', profileDetails.bio ?? '')
      form.setFieldValue('website', profileDetails.website ?? '')
      form.setFieldValue('whatsapp', profileDetails.socialLinks.whatsapp ?? '')
      form.setFieldValue('telegram', profileDetails.socialLinks.telegram ?? '')
      form.setFieldValue(
        'instagram',
        profileDetails.socialLinks.instagram ?? ''
      )
      form.setFieldValue('facebook', profileDetails.socialLinks.facebook ?? '')
      form.setFieldValue('twitter', profileDetails.socialLinks.twitter ?? '')
      form.setFieldValue('linkedin', profileDetails.socialLinks.linkedin ?? '')
    }
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    form.reset()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!profileDetails) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Failed to load profile data</p>
      </div>
    )
  }

  const socialLinks = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      color: 'text-green-600',
      placeholder: 'https://wa.me/...'
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: MessageSquare,
      color: 'text-blue-500',
      placeholder: 'https://t.me/...'
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      color: 'text-pink-600',
      placeholder: 'https://instagram.com/...'
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      placeholder: 'https://facebook.com/...'
    },
    {
      key: 'twitter',
      label: 'Twitter',
      icon: Twitter,
      color: 'text-sky-500',
      placeholder: 'https://twitter.com/...'
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      placeholder: 'https://linkedin.com/in/...'
    }
  ]

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      {/* Bio Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>About Me</CardTitle>
            {!isEditing && (
              <Button
                onClick={handleEditClick}
                size="sm"
                type="button"
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form.AppField
              children={(field) => (
                <field.TextArea
                  description={`${field.state.value?.length || 0}/500 characters`}
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              )}
              name="bio"
            />
          ) : (
            <div>
              {profileDetails?.bio ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {profileDetails.bio}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No bio added yet. Click edit to add one.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Website */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form.AppField
              children={(field) => (
                <field.Text
                  label="Website URL"
                  placeholder="https://yourwebsite.com"
                  type="url"
                />
              )}
              name="website"
            />
          ) : (
            <div>
              {profileDetails?.website ? (
                <a
                  className="text-primary hover:underline"
                  href={profileDetails.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {profileDetails.website}
                </a>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No website added
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <form.AppField
                    children={(field) => (
                      <div className="space-y-2">
                        <div className="mb-2 flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${social.color}`} />
                          <span className="font-medium text-sm">
                            {social.label}
                          </span>
                        </div>
                        <field.Text
                          placeholder={social.placeholder}
                          type="url"
                        />
                      </div>
                    )}
                    key={social.key}
                    name={social.key as keyof typeof form.state.values}
                  />
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                const value =
                  profileDetails?.socialLinks[
                    social.key as keyof typeof profileDetails.socialLinks
                  ]

                if (!value) return null

                return (
                  <a
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                    href={value}
                    key={social.key}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon className={`h-5 w-5 ${social.color}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{social.label}</p>
                      <p className="text-muted-foreground text-xs">{value}</p>
                    </div>
                  </a>
                )
              })}
              {profileDetails &&
                !Object.values(profileDetails.socialLinks).some((v) => v) && (
                  <p className="text-muted-foreground text-sm italic">
                    No social links added yet
                  </p>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            disabled={form.state.isSubmitting}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={form.state.isSubmitting}
            type="submit"
          >
            <Save className="mr-2 h-4 w-4" />
            {form.state.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </form>
  )
}
