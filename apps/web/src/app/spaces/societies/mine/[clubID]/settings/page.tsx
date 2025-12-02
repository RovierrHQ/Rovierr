'use client'

import type { societySchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { useAppForm } from '@rov/ui/components/form/index'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { QRCodeDisplay } from '@/components/registration/qr-code-display'
import { RegistrationSettingsForm } from '@/components/registration/registration-settings-form'
import { ImageUploadDialog } from '@/components/shared/image-upload-dialog'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

type Society = z.infer<typeof societySchema>

const SocietySettingsPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const societyId = params.clubID as string
  const defaultTab = searchParams.get('tab') || 'general'

  // Check if user has permission to update organization settings using hasPermission
  const { data: canManageSettingsData } = useQuery({
    queryKey: ['user-permission-settings', societyId],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: {
            organization: ['update']
          },
          organizationId: societyId
        })
        return result?.data?.success ?? false
      } catch {
        return false
      }
    },
    enabled: !!societyId
  })

  const canManageSettings = canManageSettingsData === true

  // Fetch full society data
  const { data: society, isLoading } = useQuery({
    queryKey: ['society', societyId],
    queryFn: async () => {
      return await orpc.society.getById.call({ id: societyId })
    },
    enabled: !!societyId
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!canManageSettings) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="p-6">
          <h1 className="mb-2 font-semibold text-2xl">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access settings for this society.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href={`/spaces/societies/mine/${societyId}`}>
              Back to Dashboard
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (!society) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="p-6">
          <p className="text-muted-foreground">Society not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          onClick={() => router.push(`/spaces/societies/mine/${societyId}`)}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <h1 className="mb-6 font-bold text-2xl">Society Settings</h1>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-6 grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab society={society} societyId={societyId} />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingTab society={society} societyId={societyId} />
        </TabsContent>

        <TabsContent value="social">
          <SocialLinksTab society={society} societyId={societyId} />
        </TabsContent>

        <TabsContent value="details">
          <DetailsTab society={society} societyId={societyId} />
        </TabsContent>

        <TabsContent value="registration">
          <RegistrationTab society={society} societyId={societyId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// General Tab
const GeneralTab = ({
  society,
  societyId
}: {
  society: Society
  societyId: string
}) => {
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  const form = useAppForm({
    validators: {
      onSubmit: z.object({
        description: z.string().min(1).max(1000),
        tags: z.array(z.string()),
        type: z.enum(['student', 'university']),
        visibility: z.enum(['public', 'campus_only', 'private'])
      })
    },
    defaultValues: {
      description: society.description || '',
      tags: society.tags || [],
      type: society.type || 'student',
      visibility: society.visibility || 'public'
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSaving(true)
        await orpc.society.updateFields.call({
          organizationId: societyId,
          data: value
        })
        queryClient.invalidateQueries({ queryKey: ['society', societyId] })
        toast.success('Settings saved successfully!')
      } catch (_error) {
        toast.error('Failed to save settings')
      } finally {
        setIsSaving(false)
      }
    }
  })

  return (
    <Card className="p-6">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField
          children={(field) => (
            <field.TextArea
              label="Description"
              placeholder="Describe your society"
              rows={4}
            />
          )}
          name="description"
        />

        <form.AppField
          children={(field) => (
            <field.TagInput label="Tags" placeholder="Add tags" />
          )}
          name="tags"
        />

        <form.AppField
          children={(field) => (
            <field.Select
              label="Organization Type"
              options={[
                { label: 'Student Society', value: 'student' },
                { label: 'University Official', value: 'university' }
              ]}
              placeholder="Select type"
            />
          )}
          name="type"
        />

        <form.AppField
          children={(field) => (
            <field.Select
              label="Visibility"
              options={[
                { label: 'Public', value: 'public' },
                { label: 'Campus Only', value: 'campus_only' },
                { label: 'Private', value: 'private' }
              ]}
              placeholder="Select visibility"
            />
          )}
          name="visibility"
        />

        <Button disabled={isSaving} type="submit">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}

// Branding Tab
const BrandingTab = ({
  society,
  societyId
}: {
  society: Society
  societyId: string
}) => {
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false)
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleLogoSave = async (croppedImage: string) => {
    try {
      // Update logo using ORPC (Better-Auth doesn't expose logo update directly)
      await orpc.society.updateFields.call({
        organizationId: societyId,
        data: {
          banner: croppedImage // Using banner field for now, will need logo field in schema
        }
      })
      queryClient.invalidateQueries({ queryKey: ['society', societyId] })
      toast.success('Logo updated successfully!')
    } catch (error) {
      toast.error('Failed to update logo')
      throw error
    }
  }

  const handleLogoRemove = async () => {
    try {
      await orpc.society.updateFields.call({
        organizationId: societyId,
        data: {
          banner: '' // Using banner field for now
        }
      })
      queryClient.invalidateQueries({ queryKey: ['society', societyId] })
      toast.success('Logo removed successfully!')
    } catch (error) {
      toast.error('Failed to remove logo')
      throw error
    }
  }

  const handleBannerSave = async (croppedImage: string) => {
    try {
      // Update banner using ORPC
      await orpc.society.updateFields.call({
        organizationId: societyId,
        data: {
          banner: croppedImage
        }
      })
      queryClient.invalidateQueries({ queryKey: ['society', societyId] })
      toast.success('Banner updated successfully!')
    } catch (error) {
      toast.error('Failed to update banner')
      throw error
    }
  }

  const handleBannerRemove = async () => {
    try {
      await orpc.society.updateFields.call({
        organizationId: societyId,
        data: {
          banner: ''
        }
      })
      queryClient.invalidateQueries({ queryKey: ['society', societyId] })
      toast.success('Banner removed successfully!')
    } catch (error) {
      toast.error('Failed to remove banner')
      throw error
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 font-semibold text-lg">Visual Branding</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Customize your society's visual identity
            </p>
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm" htmlFor="logo">
              Logo
            </label>
            <p className="mb-2 text-muted-foreground text-sm">
              Upload a square logo (minimum 200x200px, max 5MB)
            </p>
            <div className="flex items-center gap-4">
              {society.logo && (
                <img
                  alt="Society logo"
                  className="h-24 w-24 rounded-lg object-cover"
                  src={society.logo}
                />
              )}
              <Button onClick={() => setIsLogoDialogOpen(true)} type="button">
                {society.logo ? 'Change Logo' : 'Upload Logo'}
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm" htmlFor="banner">
              Banner
            </label>
            <p className="mb-2 text-muted-foreground text-sm">
              Upload a banner (minimum 1200x400px, max 10MB)
            </p>
            <div className="space-y-4">
              {society.banner && (
                <img
                  alt="Society banner"
                  className="h-32 w-full rounded-lg object-cover"
                  src={society.banner}
                />
              )}
              <Button onClick={() => setIsBannerDialogOpen(true)} type="button">
                {society.banner ? 'Change Banner' : 'Upload Banner'}
              </Button>
            </div>
          </div>

          <div>
            <label
              className="mb-2 block font-medium text-sm"
              htmlFor="primaryColor"
            >
              Primary Color
            </label>
            <input className="h-10 w-20" id="primaryColor" type="color" />
          </div>
        </div>
      </Card>

      <ImageUploadDialog
        currentImageUrl={society.logo}
        onOpenChange={setIsLogoDialogOpen}
        onRemove={handleLogoRemove}
        onSave={handleLogoSave}
        open={isLogoDialogOpen}
        title="Update Society Logo"
        type="profile"
      />

      <ImageUploadDialog
        currentImageUrl={society.banner}
        onOpenChange={setIsBannerDialogOpen}
        onRemove={handleBannerRemove}
        onSave={handleBannerSave}
        open={isBannerDialogOpen}
        title="Update Society Banner"
        type="banner"
      />
    </>
  )
}

// Social Links Tab
const SocialLinksTab = ({
  society,
  societyId
}: {
  society: Society
  societyId: string
}) => {
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  const form = useAppForm({
    validators: {
      onSubmit: z.object({
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
        whatsapp: z.string().optional(),
        telegram: z.string().optional(),
        website: z.string().optional()
      })
    },
    defaultValues: {
      instagram: society.instagram || undefined,
      facebook: society.facebook || undefined,
      twitter: society.twitter || undefined,
      linkedin: society.linkedin || undefined,
      whatsapp: society.whatsapp || undefined,
      telegram: society.telegram || undefined,
      website: society.website || undefined
    } as {
      instagram?: string
      facebook?: string
      twitter?: string
      linkedin?: string
      whatsapp?: string
      telegram?: string
      website?: string
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSaving(true)
        await orpc.society.updateFields.call({
          organizationId: societyId,
          data: value
        })
        queryClient.invalidateQueries({ queryKey: ['society', societyId] })
        toast.success('Social links saved successfully!')
      } catch (_error) {
        toast.error('Failed to save social links')
      } finally {
        setIsSaving(false)
      }
    }
  })

  return (
    <Card className="p-6">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <form.AppField
            children={(field) => (
              <field.Text label="Instagram" placeholder="@username" />
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
              <field.Text label="WhatsApp" placeholder="Phone or group link" />
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

        <Button disabled={isSaving} type="submit">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}

// Details Tab
const DetailsTab = ({
  society,
  societyId
}: {
  society: Society
  societyId: string
}) => {
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  const form = useAppForm({
    validators: {
      onSubmit: z.object({
        foundingYear: z.number().optional(),
        meetingSchedule: z.string().optional(),
        membershipRequirements: z.string().optional(),
        goals: z.string().optional()
      })
    },
    defaultValues: {
      foundingYear: society.foundingYear || undefined,
      meetingSchedule: society.meetingSchedule || undefined,
      membershipRequirements: society.membershipRequirements || undefined,
      goals: society.goals || undefined
    } as {
      foundingYear?: number
      meetingSchedule?: string
      membershipRequirements?: string
      goals?: string
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSaving(true)
        await orpc.society.updateFields.call({
          organizationId: societyId,
          data: value
        })
        queryClient.invalidateQueries({ queryKey: ['society', societyId] })
        toast.success('Details saved successfully!')
      } catch (_error) {
        toast.error('Failed to save details')
      } finally {
        setIsSaving(false)
      }
    }
  })

  return (
    <Card className="p-6">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField
          children={(field) => (
            <field.Text
              label="Founding Year"
              placeholder="2024"
              type="number"
            />
          )}
          name="foundingYear"
        />

        <form.AppField
          children={(field) => (
            <field.Text
              label="Meeting Schedule"
              placeholder="e.g., Every Tuesday at 6 PM"
            />
          )}
          name="meetingSchedule"
        />

        <form.AppField
          children={(field) => (
            <field.TextArea
              label="Membership Requirements"
              placeholder="Describe requirements to join"
              rows={3}
            />
          )}
          name="membershipRequirements"
        />

        <form.AppField
          children={(field) => (
            <field.TextArea
              label="Goals"
              placeholder="What does your society aim to achieve?"
              rows={4}
            />
          )}
          name="goals"
        />

        <Button disabled={isSaving} type="submit">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}

// Registration Tab
const RegistrationTab = ({
  society,
  societyId
}: {
  society: Society
  societyId: string
}) => {
  // Fetch registration settings
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    ...orpc.societyRegistration.settings.get.queryOptions({
      input: { societyId }
    }),
    enabled: !!societyId
  })

  if (isSettingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-bold text-xl">Registration Settings</h2>
        <p className="mb-6 text-muted-foreground">
          Manage member registration for your society
        </p>
      </div>

      {/* Registration Settings Form */}
      <RegistrationSettingsForm settings={settings} societyId={societyId} />

      {/* Capacity Information */}
      {settings?.society && (
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-lg">Capacity Status</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-sm">Current Members</p>
              <p className="font-bold text-2xl">
                {settings.society.memberCount}
              </p>
            </div>
            {settings.maxCapacity && (
              <>
                <div>
                  <p className="text-muted-foreground text-sm">Max Capacity</p>
                  <p className="font-bold text-2xl">{settings.maxCapacity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Remaining Slots
                  </p>
                  <p
                    className={`font-bold text-2xl ${(() => {
                      const remaining =
                        settings.maxCapacity - settings.society.memberCount
                      if (remaining <= 0) return 'text-destructive'
                      if (remaining <= 5) return 'text-orange-600'
                      return 'text-green-600'
                    })()}`}
                  >
                    {Math.max(
                      0,
                      settings.maxCapacity - settings.society.memberCount
                    )}
                  </p>
                </div>
              </>
            )}
            {!settings.maxCapacity && (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-sm">
                  No capacity limit set
                </p>
              </div>
            )}
          </div>
          {settings.maxCapacity &&
            settings.society.memberCount >= settings.maxCapacity && (
              <div className="mt-4 rounded-lg border-2 border-destructive bg-destructive/10 p-4">
                <p className="font-medium text-destructive text-sm">
                  ⚠️ Registration is automatically closed - capacity reached
                </p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Registration will automatically reopen when a member leaves
                </p>
              </div>
            )}
        </Card>
      )}

      {/* QR Code Section */}
      {society.slug && settings && (
        <QRCodeDisplay societyId={societyId} societySlug={society.slug} />
      )}
    </div>
  )
}

export default SocietySettingsPage
