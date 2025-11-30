'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeDisplay } from '@/components/registration/qr-code-display'
import { RegistrationSettingsForm } from '@/components/registration/registration-settings-form'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

const RegistrationSettingsPage = () => {
  const params = useParams()
  const router = useRouter()
  const societyId = params.clubID as string

  // Check if user has permission to update organization settings
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

  // Fetch society data
  const { data: society, isLoading: isSocietyLoading } = useQuery(
    orpc.society.getById.queryOptions({ input: { id: societyId } })
  )

  // Fetch registration settings
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    ...orpc.societyRegistration.settings.get.queryOptions({
      input: { societyId }
    }),
    enabled: !!societyId && canManageSettings
  })

  const isLoading = isSocietyLoading || isSettingsLoading

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
            You don't have permission to access registration settings for this
            society.
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
          onClick={() =>
            router.push(`/spaces/societies/mine/${societyId}/settings`)
          }
          size="sm"
          variant="ghost"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>
      </div>

      <h1 className="mb-2 font-bold text-2xl">Registration Settings</h1>
      <p className="mb-6 text-muted-foreground">
        Manage member registration for your society
      </p>

      <div className="space-y-6">
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
                    <p className="text-muted-foreground text-sm">
                      Max Capacity
                    </p>
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
    </div>
  )
}

export default RegistrationSettingsPage
