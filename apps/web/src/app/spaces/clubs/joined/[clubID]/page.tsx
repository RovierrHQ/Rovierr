'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Card, CardContent } from '@rov/ui/components/card'
import { Skeleton } from '@rov/ui/components/skeleton'
import { Users } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { authClient } from '@/lib/auth-client'

const ClubProfilePage = () => {
  const params = useParams()
  const clubID = params?.clubID as string

  const { data: organizations, isPending } = authClient.useListOrganizations()

  const club = useMemo(() => {
    if (!(organizations && clubID)) return null
    return organizations.find((org) => org.id === clubID)
  }, [organizations, clubID])

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
              Club not found or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get additional fields from the organization object
  // Note: better-auth returns basic fields, we may need to fetch full details via ORPC
  const banner = (club as { banner?: string })?.banner
  const logo = (club as { logo?: string })?.logo
  const description = (club as { description?: string })?.description
  const tags = (club as { tags?: string[] })?.tags || []

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Banner */}
        <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
          {banner ? (
            <img
              alt="Club banner"
              className="h-full w-full object-cover"
              src={banner}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-white">
                <Users className="mx-auto mb-2 h-12 w-12" />
                <p className="text-sm opacity-80">No banner image</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="-mt-16 relative">
                <Avatar className="h-24 w-24 border-4 border-background">
                  {logo ? (
                    <AvatarImage alt={club.name} src={logo} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {club.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="mt-4 flex-1 space-y-4 md:mt-0">
                <div>
                  <h1 className="mb-2 font-bold text-3xl">{club.name}</h1>
                  {description && (
                    <p className="mb-3 text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  )}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Posts Section - Placeholder */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-semibold text-xl">Recent Posts</h2>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-medium text-muted-foreground">
                No posts yet
              </p>
              <p className="text-muted-foreground text-sm">
                Posts and updates will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ClubProfilePage
