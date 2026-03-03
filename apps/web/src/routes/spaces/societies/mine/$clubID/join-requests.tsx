import { Card, CardContent, CardHeader } from '@rov/ui/components/card'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { JoinRequests } from '@web/components/clubs/members/join-requests'
import { authClient } from '@web/lib/auth-client'
import { Users } from 'lucide-react'
import { useMemo } from 'react'

export const Route = createFileRoute(
  '/spaces/societies/mine/$clubID/join-requests'
)({
  component: JoinRequestsPage
})

function JoinRequestsPage() {
  const params = useParams({
    from: '/spaces/societies/mine/$clubID/join-requests'
  })
  const clubID = params.clubID

  const { data: organizations, isPending: isLoadingOrgs } =
    authClient.useListOrganizations()

  const club = useMemo(() => {
    if (!(organizations && clubID)) return null
    return organizations.find((org) => org.id === clubID)
  }, [organizations, clubID])

  // Check if user has organization update permission
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
              Club not found or you don&apos;t have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!canManageSettings) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              You don&apos;t have permission to view join requests for this
              society.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            className="text-muted-foreground hover:text-primary"
            params={{ clubID }}
            to="/spaces/societies/mine/$clubID/members"
          >
            <Users className="h-5 w-5" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="font-bold text-2xl">Join Requests</h1>
        </div>
        <p className="text-muted-foreground">
          Review and manage join requests for {club.name}
        </p>
      </div>

      <JoinRequests organizationId={clubID} />
    </div>
  )
}
