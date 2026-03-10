import { Skeleton } from '@rov/ui/components/skeleton'
import { Tabs, TabsContent } from '@rov/ui/components/tabs'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { JoinRequests } from '@web/components/clubs/members/join-requests'
import { MemberList } from '@web/components/clubs/members/member-list'
import { PendingInvitations } from '@web/components/clubs/members/pending-invitations'
import { RoleManagement } from '@web/components/clubs/members/role-management'
import { authClient } from '@web/lib/auth-client'
import { ClipboardList, Mail, Shield, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/spaces/societies/mine/$clubID/members')({
  component: MembersPage
})

// Summary Card Component
function SummaryCard({
  title,
  count,
  icon: Icon,
  isActive,
  onClick,
  variant = 'default'
}: {
  title: string
  count: number | string
  icon: React.ElementType
  isActive?: boolean
  onClick?: () => void
  variant?: 'default' | 'warning' | 'success'
}) {
  const variantStyles = {
    default: 'bg-card hover:bg-accent',
    warning:
      'bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    success:
      'bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 border-green-200 dark:border-green-800'
  }

  const iconColors = {
    default: 'text-primary',
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-green-600 dark:text-green-400'
  }

  return (
    <button
      className={`flex flex-col items-start rounded-lg border p-4 text-left transition-all ${variantStyles[variant]} ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className={`rounded-full p-2 ${variant === 'default' ? 'bg-primary/10' : variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}
        >
          <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
        </div>
        <span className="text-3xl font-bold">{count}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{title}</p>
    </button>
  )
}

function MembersPage() {
  const params = useParams({ from: '/spaces/societies/mine/$clubID/members' })
  const clubID = params.clubID
  const [activeTab, setActiveTab] = useState('members')

  const { data: organizations, isPending: isLoadingOrgs } =
    authClient.useListOrganizations()

  const club = useMemo(() => {
    if (!(organizations && clubID)) return null
    return organizations.find((org) => org.id === clubID)
  }, [organizations, clubID])

  const { data: canManageSettingsData } = useQuery({
    queryKey: ['user-permission-settings', clubID],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: { organization: ['update'] },
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

  // Fetch counts for summary cards
  const { data: membersData } = useQuery({
    queryKey: ['organization-members-count', clubID],
    queryFn: async () => {
      const result = await authClient.organization.listMembers({
        query: {
          limit: 1,
          offset: 0,
          organizationId: clubID
        }
      })
      return result?.data?.total ?? 0
    },
    enabled: !!clubID
  })

  const { data: invitationsData } = useQuery({
    queryKey: ['organization-invitations-count', clubID],
    queryFn: async () => {
      const result = await authClient.organization.listInvitations({
        query: {
          organizationId: clubID
        }
      })
      return result?.data?.length ?? 0
    },
    enabled: !!clubID
  })

  const { data: joinRequestsData } = useQuery({
    queryKey: ['join-requests-count', clubID],
    queryFn: async () => {
      const api = await import('@web/lib/api-client')
      const response = await api.society.registration['join-request'].list.get({
        query: {
          societyId: clubID,
          status: ['pending'],
          limit: 1,
          offset: 0
        }
      })
      return response?.totalCount ?? 0
    },
    enabled: !!clubID
  })

  const { data: rolesData } = useQuery({
    queryKey: ['organization-roles-count', clubID],
    queryFn: async () => {
      const result = await authClient.organization.listRoles({
        query: {
          organizationId: clubID
        }
      })
      return result?.data?.length ?? 0
    },
    enabled: !!clubID
  })

  const totalMembers = membersData ?? 0
  const pendingInvitations = invitationsData ?? 0
  const joinRequestsCount = joinRequestsData ?? 0
  const rolesCount = rolesData ?? 0

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
  }

  if (isLoadingOrgs) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton className="h-24 w-full" key={i.toString()} />
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">
          Club not found or you don't have access to it.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="mb-1 font-bold text-3xl">Members</h1>
        <p className="text-muted-foreground text-sm">
          {canManageSettings
            ? `Manage members, roles, and permissions for ${club.name}`
            : `Members of ${club.name}`}
        </p>
      </div>

      {/* Summary Cards */}
      {canManageSettings ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            count={totalMembers}
            icon={Users}
            isActive={activeTab === 'members'}
            onClick={() => handleTabClick('members')}
            title="Total Members"
          />
          <SummaryCard
            count={pendingInvitations}
            icon={Mail}
            isActive={activeTab === 'invitations'}
            onClick={() => handleTabClick('invitations')}
            title="Pending Invitations"
            variant={pendingInvitations > 0 ? 'warning' : 'default'}
          />
          <SummaryCard
            count={joinRequestsCount}
            icon={ClipboardList}
            isActive={activeTab === 'join-requests'}
            onClick={() => handleTabClick('join-requests')}
            title="Join Requests"
            variant={joinRequestsCount > 0 ? 'success' : 'default'}
          />
          <SummaryCard
            count={rolesCount}
            icon={Shield}
            isActive={activeTab === 'roles'}
            onClick={() => handleTabClick('roles')}
            title="Roles"
          />
        </div>
      ) : null}

      {canManageSettings ? (
        <Tabs
          className="w-full"
          defaultValue="members"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsContent className="mt-0" value="members">
            <MemberList organizationId={clubID} showHeader={false} />
          </TabsContent>

          <TabsContent className="mt-0" value="invitations">
            <PendingInvitations organizationId={clubID} showHeader={false} />
          </TabsContent>

          <TabsContent className="mt-0" value="join-requests">
            <JoinRequests organizationId={clubID} showHeader={false} />
          </TabsContent>

          <TabsContent className="mt-0" value="roles">
            <RoleManagement organizationId={clubID} showHeader={false} />
          </TabsContent>
        </Tabs>
      ) : (
        <MemberList organizationId={clubID} showHeader={true} />
      )}
    </div>
  )
}
