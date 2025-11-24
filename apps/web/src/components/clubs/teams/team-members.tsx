'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Search, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

interface TeamMembersProps {
  organizationId: string
  teamId: string
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

export function TeamMembers({ organizationId, teamId }: TeamMembersProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch team members
  const {
    data: membersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const result = await authClient.organization.listTeamMembers({
        query: {
          teamId
        }
      })
      // Handle error response
      if (isErrorResponse(result)) {
        throw new Error(result.error?.message || 'Failed to fetch team members')
      }
      return result
    }
  })

  // Extract members array from Data wrapper - TypeScript infers the type
  const members = (() => {
    if (!hasData(membersData)) return []
    const data = membersData.data
    return Array.isArray(data) ? data : []
  })()

  // Remove team member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await authClient.organization.removeTeamMember({
        teamId,
        userId
      })
      // Handle error response - TypeScript infers the type
      if (isErrorResponse(result)) {
        throw new Error(result.error?.message || 'Failed to remove team member')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['team-members', teamId]
      })
      queryClient.invalidateQueries({
        queryKey: ['team-members-count', teamId]
      })
      toast.success('Member removed from team successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove member from team')
    }
  })

  // Check if user can manage team members
  const { data: canManageMembers = false } = useQuery({
    queryKey: ['user-permission-manage-team-members', organizationId],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: {
            team: ['update']
          },
          organizationId
        })
        return result ?? false
      } catch {
        return false
      }
    }
  })

  // Filter members by search query - TypeScript infers the types
  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return true
    const m = member as {
      user?: {
        name?: string
        email?: string
      }
    }
    const query = searchQuery.toLowerCase()
    const name = m.user?.name?.toLowerCase() ?? ''
    const email = m.user?.email?.toLowerCase() ?? ''
    return name.includes(query) || email.includes(query)
  })

  const handleRemoveMember = (userId: string, memberName: string) => {
    if (
      !confirm(`Are you sure you want to remove ${memberName} from this team?`)
    ) {
      return
    }
    removeMemberMutation.mutate(userId)
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
              <Skeleton className="h-16 w-full" key={i.toString()} />
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
            Failed to load team members. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members ({members.length})</CardTitle>
            <CardDescription>Manage members in this team</CardDescription>
          </div>
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
              placeholder="Search members by name or email..."
              value={searchQuery}
            />
          </div>

          {/* Members List */}
          {filteredMembers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No members found matching your search'
                  : 'No members in this team yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member) => {
                const m = member as {
                  id: string
                  userId: string
                  createdAt: Date | string
                  user?: {
                    id: string
                    name?: string
                    email?: string
                    image?: string | null
                  }
                }
                return (
                  <div
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    key={m.id}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          alt={m.user?.name ?? ''}
                          src={m.user?.image ?? undefined}
                        />
                        <AvatarFallback>
                          {m.user?.name
                            ?.split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {m.user?.name ?? 'Unknown User'}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {m.user?.email ?? ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-muted-foreground text-sm">
                        Added{' '}
                        {m.createdAt
                          ? format(new Date(m.createdAt), 'MMM d, yyyy')
                          : 'N/A'}
                      </div>
                      {canManageMembers && (
                        <Button
                          onClick={() =>
                            handleRemoveMember(
                              m.userId ?? m.user?.id ?? '',
                              m.user?.name ?? 'this member'
                            )
                          }
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
