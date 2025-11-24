'use client'

import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@rov/ui/components/dropdown-menu'
import { Input } from '@rov/ui/components/input'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { MoreVertical, Search, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { AssignMembersDialog } from './assign-members-dialog'
import { CreateTeamDialog } from './create-team-dialog'

interface TeamListProps {
  organizationId: string
}

// Type guard to check if response is an error
function isErrorResponse(
  response:
    | { data: unknown; error: { code?: string; message?: string } | null }
    | undefined
): response is { error: { code?: string; message?: string }; data: null } {
  return (
    response !== undefined &&
    response.error !== null &&
    response.error !== undefined
  )
}

// Type guard to check if response has data
function hasData<T>(
  response:
    | { data: T | null; error: { code?: string; message?: string } | null }
    | undefined
): response is { data: T; error: null } {
  return (
    response !== undefined && response.data !== null && response.error === null
  )
}

export function TeamList({ organizationId }: TeamListProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  // Fetch teams
  const {
    data: teamsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['organization-teams', organizationId],
    queryFn: async () => {
      const result = await authClient.organization.listTeams({
        query: {
          organizationId
        }
      })
      // Handle error response
      if (isErrorResponse(result)) {
        throw new Error(result.error?.message || 'Failed to fetch teams')
      }
      return result
    }
  })

  // Extract teams array from Data wrapper - TypeScript infers the type
  const teams = (() => {
    if (!hasData(teamsData)) return []
    const data = teamsData.data
    return Array.isArray(data) ? data : []
  })()

  // Fetch member counts for all teams in parallel
  const { data: teamMemberCounts } = useQuery({
    queryKey: [
      'team-members-counts',
      organizationId,
      teams.map((t) => t.id).join(',')
    ],
    queryFn: async () => {
      const counts: Record<string, number> = {}
      await Promise.all(
        teams.map(async (team) => {
          try {
            const result = await authClient.organization.listTeamMembers({
              query: {
                teamId: team.id
              }
            })
            // Handle error response - TypeScript infers the type
            if (isErrorResponse(result)) {
              counts[team.id] = 0
              return
            }
            // Extract members array from Data wrapper - TypeScript infers the type
            if (hasData(result)) {
              const data = result.data
              counts[team.id] = Array.isArray(data) ? data.length : 0
            } else {
              counts[team.id] = 0
            }
          } catch {
            counts[team.id] = 0
          }
        })
      )
      return counts
    },
    enabled: teams.length > 0
  })

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const result = await authClient.organization.removeTeam({
        teamId,
        organizationId
      })
      // Handle error response
      if (result && 'error' in result) {
        throw new Error(result.error?.message || 'Failed to delete team')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-teams', organizationId]
      })
      toast.success('Team deleted successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete team')
    }
  })

  // Check if user can manage teams using hasPermission
  const { data: canCreateTeam = false } = useQuery({
    queryKey: ['user-permission-create-team', organizationId],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: {
            team: ['create']
          },
          organizationId
        })
        return result ?? false
      } catch {
        return false
      }
    }
  })

  const { data: canManageTeams = false } = useQuery({
    queryKey: ['user-permission-manage-team', organizationId],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: {
            team: ['update', 'delete']
          },
          organizationId
        })
        return result ?? false
      } catch {
        return false
      }
    }
  })

  // Filter teams by search query
  const filteredTeams = teams.filter((team) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return team.name.toLowerCase().includes(query)
  })

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${teamName}"? This will remove all team members from this team.`
      )
    ) {
      return
    }
    deleteTeamMutation.mutate(teamId)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton className="h-20 w-full" key={i.toString()} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">
            Failed to load teams. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Teams ({teams.length})</CardTitle>
              <CardDescription>
                Organize members into teams for better collaboration
              </CardDescription>
            </div>
            {canCreateTeam && (
              <CreateTeamDialog
                organizationId={organizationId}
                trigger={
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                }
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams by name..."
                value={searchQuery}
              />
            </div>

            {/* Teams Grid */}
            {filteredTeams.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  {(() => {
                    if (searchQuery)
                      return 'No teams found matching your search'
                    if (canCreateTeam)
                      return 'No teams yet. Create your first team to get started.'
                    return 'No teams found'
                  })()}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeams.map((team) => {
                  const memberCount = teamMemberCounts?.[team.id] ?? 0

                  return (
                    <Card key={team.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="mb-1 text-lg">
                              {team.name}
                            </CardTitle>
                            <CardDescription>
                              Created{' '}
                              {team.createdAt
                                ? format(
                                    new Date(team.createdAt),
                                    'MMM d, yyyy'
                                  )
                                : 'N/A'}
                            </CardDescription>
                          </div>
                          {canManageTeams && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setSelectedTeamId(team.id)}
                                >
                                  <Users className="mr-2 h-4 w-4" />
                                  Manage Members
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteTeam(team.id, team.name)
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground text-sm">
                              {teamMemberCounts === undefined ? (
                                <Skeleton className="h-4 w-8" />
                              ) : (
                                `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`
                              )}
                            </span>
                          </div>
                          <Button
                            onClick={() => setSelectedTeamId(team.id)}
                            size="sm"
                            variant="outline"
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign Members Dialog - rendered outside Card to avoid nesting issues */}
      {selectedTeamId && (
        <AssignMembersDialog
          onClose={() => setSelectedTeamId(null)}
          organizationId={organizationId}
          teamId={selectedTeamId}
        />
      )}
    </>
  )
}
