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
import {
  createFileRoute,
  Link,
  useParams,
  useRouter,
  useSearch
} from '@tanstack/react-router'
import { ImageUploadDialog } from '@web/components/shared/image-upload-dialog'
import api from '@web/lib/api-client'
import { authClient } from '@web/lib/auth-client'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export const Route = createFileRoute('/spaces/societies/mine/$clubID/settings')(
  {
    component: SocietySettingsPage
  }
)

function SocietySettingsPage() {
  const params = useParams({ from: '/spaces/societies/mine/$clubID/settings' })
  const search = useSearch({ from: '/spaces/societies/mine/$clubID/settings' })
  const router = useRouter()
  const societyId = params.clubID
  const defaultTab = search.tab || 'general'

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
      const response = await api.society({ id: societyId }).get()
      return response.data ?? null
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
            You don&apos;t have permission to access settings for this society.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link
              params={{ clubID: societyId }}
              to="/spaces/societies/mine/$clubID"
            >
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
          onClick={() =>
            router.navigate({
              to: '/spaces/societies/mine/$clubID',
              params: { clubID: societyId }
            })
          }
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
function GeneralTab({
  society,
  societyId
}: {
  society: {
    description?: string
    tags?: string[]
    type?: string
    visibility?: string
  }
  societyId: string
}) {
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
        await api.society({ id: societyId }).fields.patch(value)
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
function BrandingTab({
  society,
  societyId
}: {
  society: { logo?: string; banner?: string }
  societyId: string
}) {
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false)
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleLogoSave = async (croppedImage: string) => {
    try {
      await api.society({ id: societyId }).fields.patch({
        logo: croppedImage
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
      await api.society({ id: societyId }).fields.patch({
        logo: ''
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
      await api.society({ id: societyId }).fields.patch({
        banner: croppedImage
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
      await api.society({ id: societyId }).fields.patch({
        banner: ''
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
              Customize your society&apos;s visual identity
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
                  height={96}
                  src={society.logo}
                  width={96}
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
                  height={128}
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
function SocialLinksTab({
  society,
  societyId
}: {
  society: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    whatsapp?: string
    telegram?: string
    website?: string
  }
  societyId: string
}) {
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
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSaving(true)
        await api.society({ id: societyId }).fields.patch(value)
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
function DetailsTab({
  society,
  societyId
}: {
  society: {
    foundingYear?: number
    meetingSchedule?: string
    membershipRequirements?: string
    goals?: string
  }
  societyId: string
}) {
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
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSaving(true)
        await api.society({ id: societyId }).fields.patch(value)
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
function RegistrationTab({
  society,
  societyId
}: {
  society: { slug?: string } | null
  societyId: string
}) {
  // For now, show a simple notice about registration settings
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-bold text-xl">Registration Settings</h2>
        <p className="mb-6 text-muted-foreground">
          Manage member registration for your society
        </p>
      </div>

      {/* Future Feature Notice */}
      <Card className="border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-blue-900 dark:text-blue-100">
              Advanced Registration Features (Coming Soon)
            </h3>
            <p className="text-blue-800 text-sm dark:text-blue-200">
              Advanced registration settings like custom forms, payment
              integration, and registration periods are coming soon. For now,
              simple join requests are always enabled - anyone can request to
              join your society, and you can manage these requests in the{' '}
              <Link
                className="font-medium underline"
                params={{ clubID: societyId }}
                search={{ tab: 'join-requests' }}
                to="/spaces/societies/mine/$clubID/members"
              >
                Members → Join Requests
              </Link>{' '}
              tab.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-lg">Current Status</h2>
        <p className="text-muted-foreground">
          Join requests are currently enabled. Members can request to join your
          society, and you can approve or reject these requests in the Members
          section.
        </p>
      </Card>
    </div>
  )
}
