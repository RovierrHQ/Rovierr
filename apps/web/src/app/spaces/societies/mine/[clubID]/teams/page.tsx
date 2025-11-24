'use client'

import { Card, CardContent, CardHeader } from '@rov/ui/components/card'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { TeamList } from '@/components/clubs/teams/team-list'
import { authClient } from '@/lib/auth-client'

const TeamsPage = () => {
  const params = useParams()
  const clubID = params?.clubID as string

  const { data: organizations, isPending: isLoadingOrgs } =
    authClient.useListOrganizations()

  const club = useMemo(() => {
    if (!(organizations && clubID)) return null
    return organizations.find((org) => org.id === clubID)
  }, [organizations, clubID])

  if (isLoadingOrgs) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="mb-2 font-bold text-3xl">Teams</h1>
        <p className="text-muted-foreground">
          Organize members into teams for {club.name}
        </p>
      </div>

      <TeamList organizationId={clubID} />
    </div>
  )
}

export default TeamsPage
