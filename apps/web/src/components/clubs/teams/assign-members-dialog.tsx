'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { Input } from '@rov/ui/components/input'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

interface AssignMembersDialogProps {
  organizationId: string
  teamId: string
  onClose: () => void
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

export function AssignMembersDialog({
  organizationId,
  teamId,
  onClose
}: AssignMembersDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()

  // Fetch organization members
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      const result = await authClient.organization.listMembers({
        query: {
          limit: 1000,
          offset: 0,
          organizationId
        }
      })
      // Handle error response
      if (isErrorResponse(result)) {
        throw new Error(
          result.error?.message || 'Failed to fetch organization members'
        )
      }
      return result
    }
  })

  // Fetch current team members
  const { data: teamMembersData, isLoading: isLoadingTeamMembers } = useQuery({
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

  // Extract members arrays from Data wrappers - TypeScript infers the types
  const allMembers = (() => {
    if (!hasData(membersData)) return []
    const data = membersData.data
    if (data && typeof data === 'object' && 'members' in data) {
      const members = (data as { members?: unknown[] }).members
      return Array.isArray(members) ? members : []
    }
    return []
  })()

  const teamMembers = (() => {
    if (!hasData(teamMembersData)) return []
    const data = teamMembersData.data
    return Array.isArray(data) ? data : []
  })()

  const currentTeamMemberIds = new Set(
    teamMembers.map((m) => {
      const member = m as { userId?: string; user?: { id?: string } }
      return member.userId ?? member.user?.id ?? ''
    })
  )

  // Filter out members already in team - TypeScript infers the types
  const availableMembers = useMemo(() => {
    return allMembers.filter((member) => {
      const m = member as { userId?: string; user?: { id?: string } }
      const userId = m.userId ?? m.user?.id ?? ''
      return !currentTeamMemberIds.has(userId)
    })
  }, [allMembers, currentTeamMemberIds])

  // Filter by search query - TypeScript infers the types
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return availableMembers
    const query = searchQuery.toLowerCase()
    return availableMembers.filter((member) => {
      const m = member as {
        user?: {
          name?: string
          email?: string
        }
      }
      const name = m.user?.name?.toLowerCase() ?? ''
      const email = m.user?.email?.toLowerCase() ?? ''
      return name.includes(query) || email.includes(query)
    })
  }, [availableMembers, searchQuery])

  // Add team members mutation
  const addMembersMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      // Add members one by one (better-auth might not support bulk add)
      const promises = userIds.map(async (userId) => {
        const result = await authClient.organization.addTeamMember({
          teamId,
          userId
        })
        // Handle error response - TypeScript infers the type
        if (isErrorResponse(result)) {
          throw new Error(
            result.error?.message || `Failed to add member ${userId}`
          )
        }
        return result
      })
      await Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['team-members', teamId]
      })
      queryClient.invalidateQueries({
        queryKey: ['team-members-count', teamId]
      })
      queryClient.invalidateQueries({
        queryKey: ['organization-teams', organizationId]
      })
      toast.success(
        `Successfully added ${selectedUserIds.size} ${selectedUserIds.size === 1 ? 'member' : 'members'} to the team`
      )
      setSelectedUserIds(new Set())
      onClose()
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add members to team')
    }
  })

  const toggleMemberSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUserIds(newSelection)
  }

  const handleAddMembers = () => {
    if (selectedUserIds.size === 0) {
      toast.error('Please select at least one member')
      return
    }
    addMembersMutation.mutate(Array.from(selectedUserIds))
  }

  const isLoading = isLoadingMembers || isLoadingTeamMembers

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open>
      <DialogContent className="max-h-[80vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Members to Team</DialogTitle>
          <DialogDescription>
            Select members from your organization to add to this team.
          </DialogDescription>
        </DialogHeader>

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

          {/* Selected count */}
          {selectedUserIds.size > 0 && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <span className="font-medium text-sm">
                {selectedUserIds.size}{' '}
                {selectedUserIds.size === 1 ? 'member' : 'members'} selected
              </span>
              <Button
                onClick={() => setSelectedUserIds(new Set())}
                size="sm"
                variant="ghost"
              >
                Clear selection
              </Button>
            </div>
          )}

          {/* Members List */}
          <div className="max-h-[400px] overflow-y-auto rounded-lg border">
            {(() => {
              if (isLoading) {
                return (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton className="h-16 w-full" key={i.toString()} />
                    ))}
                  </div>
                )
              }
              if (filteredMembers.length === 0) {
                return (
                  <div className="py-12 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {(() => {
                        if (searchQuery)
                          return 'No members found matching your search'
                        if (availableMembers.length === 0)
                          return 'All organization members are already in this team'
                        return 'No members available'
                      })()}
                    </p>
                  </div>
                )
              }
              return (
                <div className="divide-y">
                  {filteredMembers.map((member) => {
                    const m = member as {
                      id: string
                      userId?: string
                      user?: {
                        id?: string
                        name?: string
                        email?: string
                        image?: string | null
                      }
                    }
                    const userId = m.userId ?? m.user?.id ?? m.id
                    const isSelected = selectedUserIds.has(userId)

                    return (
                      <div
                        className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50"
                        key={m.id}
                        onClick={() => toggleMemberSelection(userId)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
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
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={
              selectedUserIds.size === 0 || addMembersMutation.isPending
            }
            onClick={handleAddMembers}
          >
            {(() => {
              if (addMembersMutation.isPending) return 'Adding...'
              const count = selectedUserIds.size
              const label = count === 1 ? 'Member' : 'Members'
              return `Add ${count > 0 ? `${count} ` : ''}${label}`
            })()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
