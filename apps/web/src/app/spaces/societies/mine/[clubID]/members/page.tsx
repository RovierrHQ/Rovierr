'use client'

import { Card, CardContent, CardHeader } from '@rov/ui/components/card'
import { Skeleton } from '@rov/ui/components/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList, Shield, UserPlus, Users } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { JoinRequests } from '@/components/clubs/members/join-requests'
import { MemberList } from '@/components/clubs/members/member-list'
import { PendingInvitations } from '@/components/clubs/members/pending-invitations'
import { RoleManagement } from '@/components/clubs/members/role-management'
import { authClient } from '@/lib/auth-client'

const MembersPage = () => {
  const params = useParams()
  const clubID = params?.clubID as string

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
        <h1 className="mb-2 font-bold text-3xl">Members</h1>
        {canManageSettings && (
          <p className="text-muted-foreground">
            Manage members, roles, and permissions for {club.name}
          </p>
        )}
      </div>

      {canManageSettings ? (
        <Tabs className="w-full" defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">
              <Users className="mr-2 h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="invitations">
              <UserPlus className="mr-2 h-4 w-4" />
              Invitations
            </TabsTrigger>
            <TabsTrigger value="join-requests">
              <ClipboardList className="mr-2 h-4 w-4" />
              Join Requests
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="mr-2 h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-6" value="members">
            <MemberList organizationId={clubID} />
          </TabsContent>

          <TabsContent className="mt-6" value="invitations">
            <PendingInvitations organizationId={clubID} />
          </TabsContent>

          <TabsContent className="mt-6" value="join-requests">
            <JoinRequests organizationId={clubID} />
          </TabsContent>

          <TabsContent className="mt-6" value="roles">
            <RoleManagement organizationId={clubID} />
          </TabsContent>
        </Tabs>
      ) : (
        <MemberList organizationId={clubID} />
      )}
    </div>
  )
}

export default MembersPage
