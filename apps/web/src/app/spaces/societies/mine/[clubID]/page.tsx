'use client'

import type { societySchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { Progress } from '@rov/ui/components/progress'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Settings,
  TrendingUp,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import type { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

type Society = z.infer<typeof societySchema>

const ClubProfilePage = () => {
  const params = useParams()
  const clubID = params?.clubID as string

  const { data: organizations, isPending: orgsPending } =
    authClient.useListOrganizations()

  const club = useMemo(() => {
    if (!(organizations && clubID)) return null
    return organizations.find((org) => org.id === clubID)
  }, [organizations, clubID])

  // Fetch full society data with ORPC
  const { data: society, isLoading: societyLoading } = useQuery({
    queryKey: ['society', clubID],
    queryFn: async () => {
      return await orpc.society.getById.call({ id: clubID })
    },
    enabled: !!clubID
  })

  // Check if user has permission to manage settings using hasPermission
  const { data: canManageSettingsData } = useQuery({
    queryKey: ['user-permission-settings', clubID],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: {
            organization: ['update']
          },
          organizationId: clubID
        })
        return result?.data?.success ?? false
      } catch {
        return false
      }
    },
    enabled: !!clubID
  })

  const canManageSettings = canManageSettingsData === true

  const isPending = orgsPending || societyLoading

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Banner skeleton */}
          <Skeleton className="h-48 w-full rounded-lg" />

          {/* Profile header skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent posts skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-6 w-32" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton className="h-24 w-full" key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Society not found or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-2xl">{society?.name || club?.name}</h1>
        {canManageSettings && (
          <Button asChild variant="outline">
            <Link href={`/spaces/societies/mine/${clubID}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Completion Card */}
          {society && society.profileCompletionPercentage < 100 && (
            <ProfileCompletionCard
              completion={society.profileCompletionPercentage}
              society={society}
              societyId={clubID}
            />
          )}

          {/* Recent Activity Feed - Placeholder */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-semibold text-xl">Recent Activity</h2>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 font-medium text-muted-foreground">
                  No recent activity
                </p>
                <p className="text-muted-foreground text-sm">
                  Activity and updates will appear here
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events - Placeholder */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-semibold text-xl">Upcoming Events</h2>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 font-medium text-muted-foreground">
                  No upcoming events
                </p>
                <p className="text-muted-foreground text-sm">
                  Events will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Member Highlights - Placeholder */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-semibold text-xl">Members</h2>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                  {society?.memberCount || 0} members
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {society && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 font-semibold text-xl">Quick Stats</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Profile Completion
                    </span>
                    <span className="font-semibold">
                      {society.profileCompletionPercentage}%
                    </span>
                  </div>
                  {society.foundingYear && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Founded
                      </span>
                      <span className="font-semibold">
                        {society.foundingYear}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Members
                    </span>
                    <span className="font-semibold">
                      {society.memberCount || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClubProfilePage

// Profile Completion Card Component
const ProfileCompletionCard = ({
  completion,
  society,
  societyId
}: {
  completion: number
  society: Society
  societyId: string
}) => {
  const missingItems: Array<{ label: string; section: string }> = []

  // Check what's missing
  if (!society.logo) missingItems.push({ label: 'Logo', section: 'branding' })
  if (!society.banner)
    missingItems.push({ label: 'Banner', section: 'branding' })

  const socialLinks = [
    society.instagram,
    society.facebook,
    society.twitter,
    society.linkedin,
    society.whatsapp,
    society.telegram,
    society.website
  ].filter(Boolean)

  if (socialLinks.length < 2)
    missingItems.push({ label: 'Social Links (at least 2)', section: 'social' })

  const additionalDetails = [
    society.foundingYear,
    society.meetingSchedule,
    society.membershipRequirements,
    society.goals
  ].filter(Boolean)

  if (additionalDetails.length < 2)
    missingItems.push({
      label: 'Additional Details (at least 2)',
      section: 'details'
    })

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-lg">
              Complete Your Society Profile
            </h3>
            <p className="text-muted-foreground text-sm">
              A complete profile helps members find and connect with your
              society
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">{completion}% Complete</span>
            <span className="text-muted-foreground">
              {missingItems.length} items remaining
            </span>
          </div>
          <Progress className="h-2" value={completion} />
        </div>

        {missingItems.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-sm">Missing items:</p>
            <ul className="space-y-1">
              {missingItems.map((item) => (
                <li
                  className="flex items-center gap-2 text-sm"
                  key={`${item.section}-${item.label}`}
                >
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <Link
                    className="hover:underline"
                    href={`/spaces/societies/mine/${societyId}/settings?tab=${item.section}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button asChild className="mt-4 w-full" variant="outline">
          <Link href={`/spaces/societies/mine/${societyId}/settings`}>
            Complete Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
