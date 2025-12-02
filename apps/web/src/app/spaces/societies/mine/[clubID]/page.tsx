'use client'

import type { societySchema } from '@rov/orpc-contracts'
import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { Progress } from '@rov/ui/components/progress'
import { Skeleton } from '@rov/ui/components/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@rov/ui/components/tooltip'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle2,
  Globe,
  MapPin,
  Settings,
  TrendingUp,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { z } from 'zod'
import { SocietyImageUploadDialog } from '@/components/societies/society-image-upload-dialog'
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
  const { data: society, isLoading: societyLoading } = useQuery(
    orpc.society.getById.queryOptions({ input: { id: clubID } })
  )

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

  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false)
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false)

  const isPending = orgsPending || societyLoading

  if (isPending) {
    return (
      <div className="mx-auto min-h-screen max-w-5xl">
        <div className="-mx-4 -mt-6 relative overflow-x-hidden">
          <Skeleton className="h-64 w-full" />
          <div className="-mt-20 relative px-4 sm:px-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
                <Skeleton className="h-28 w-28 rounded-full sm:h-40 sm:w-40" />
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6">
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
    <div className="mx-auto min-h-screen max-w-5xl">
      <div className="-mx-4 -mt-6 relative overflow-x-hidden">
        {/* Banner */}
        <div className="relative h-64 w-full overflow-hidden">
          {society?.banner ? (
            <img
              alt="Society Banner"
              className="h-full w-full object-cover"
              src={society.banner}
            />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600" />
          )}
          <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />

          {/* Edit Banner Button */}
          {canManageSettings && (
            <button
              aria-label="Edit banner image"
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-background/20 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-background/30"
              onClick={() => setIsBannerDialogOpen(true)}
              type="button"
            >
              <Camera className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="-mt-20 relative px-4 sm:px-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              {/* Avatar */}
              <div className="group relative flex-shrink-0">
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary opacity-60 blur-md" />
                <Avatar className="relative h-28 w-28 border-4 border-primary shadow-2xl ring-2 ring-background sm:h-40 sm:w-40">
                  <AvatarImage
                    alt={society?.name || club.name}
                    src={society?.logo ?? club.logo ?? ''}
                  />
                  <AvatarFallback className="bg-primary/10 text-3xl text-primary sm:text-4xl">
                    {(society?.name || club.name)
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Edit Logo Button */}
                {canManageSettings && (
                  <button
                    aria-label="Change society logo"
                    className="absolute right-1 bottom-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-xl transition-all hover:scale-105 hover:bg-primary/90 sm:h-11 sm:w-11"
                    onClick={() => setIsLogoDialogOpen(true)}
                    type="button"
                  >
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3 pt-0 text-center sm:space-y-4 sm:pt-6 sm:text-left">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-balance font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
                      {society?.name || club.name}
                    </h1>

                    {society?.isVerified ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-500 transition-colors hover:bg-emerald-500/15">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span className="font-medium text-xs">
                                Verified
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs" side="bottom">
                            <p className="text-sm">
                              This organization has been verified and is an
                              official society.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}

                    {society && (
                      <Badge
                        variant={
                          society.type === 'university'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {society.type === 'university'
                          ? 'Official Organization'
                          : 'Student Society'}
                      </Badge>
                    )}
                  </div>

                  {society?.description && (
                    <p className="mx-auto line-clamp-2 max-w-lg text-pretty text-muted-foreground text-sm leading-relaxed sm:mx-0">
                      {society.description}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {society?.tags &&
                    society.tags.length > 0 &&
                    society.tags.slice(0, 3).map((tag) => (
                      <Badge
                        className="border border-border/50 bg-secondary/50 text-foreground"
                        key={tag}
                        variant="secondary"
                      >
                        {tag}
                      </Badge>
                    ))}
                  {society?.memberCount !== undefined && (
                    <Badge
                      className="border border-border/50 bg-secondary/50 text-foreground"
                      variant="secondary"
                    >
                      {society.memberCount}{' '}
                      {society.memberCount === 1 ? 'Member' : 'Members'}
                    </Badge>
                  )}
                  {society?.foundingYear && (
                    <Badge
                      className="border border-border/50 bg-secondary/50 text-foreground"
                      variant="secondary"
                    >
                      Founded {society.foundingYear}
                    </Badge>
                  )}
                </div>

                {/* Location & Website */}
                <div className="flex flex-col gap-2 text-muted-foreground text-xs sm:flex-row sm:flex-wrap sm:gap-4 sm:text-sm">
                  {society?.institutionId && (
                    <div className="flex items-center justify-center gap-1 md:justify-start">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <Link
                        className="transition-colors hover:text-primary"
                        href={`/universities/${society.institutionId}`}
                      >
                        University Affiliation
                      </Link>
                    </div>
                  )}

                  {society?.website && (
                    <Link
                      className="flex items-center justify-center gap-1 transition-colors hover:text-primary md:justify-start"
                      href={society.website}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Website</span>
                    </Link>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {canManageSettings && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/spaces/societies/mine/${clubID}/settings`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mt-8 px-4 sm:px-6">
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

      {/* Image Upload Dialogs */}
      {canManageSettings && (
        <>
          <SocietyImageUploadDialog
            currentImageUrl={society?.logo ?? club.logo ?? null}
            onOpenChange={setIsLogoDialogOpen}
            open={isLogoDialogOpen}
            organizationId={clubID}
            type="logo"
          />
          <SocietyImageUploadDialog
            currentImageUrl={society?.banner ?? null}
            onOpenChange={setIsBannerDialogOpen}
            open={isBannerDialogOpen}
            organizationId={clubID}
            type="banner"
          />
        </>
      )}
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
