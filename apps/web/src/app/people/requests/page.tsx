'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { Skeleton } from '@rov/ui/components/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, UserPlus, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

export default function ConnectionRequestsPage() {
  const queryClient = useQueryClient()

  const {
    data: receivedData,
    isLoading: isLoadingReceived,
    error: receivedError
  } = useQuery(
    orpc.connection.listPending.queryOptions({
      input: {
        type: 'received',
        limit: 100,
        offset: 0
      }
    })
  )

  const {
    data: sentData,
    isLoading: isLoadingSent,
    error: sentError
  } = useQuery(
    orpc.connection.listPending.queryOptions({
      input: {
        type: 'sent',
        limit: 100,
        offset: 0
      }
    })
  )

  const receivedRequests = receivedData?.connections || []
  const sentRequests = sentData?.connections || []

  const acceptMutation = useMutation(
    orpc.connection.accept.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['connection', 'pending'] })
        queryClient.invalidateQueries({ queryKey: ['people', 'list'] })
        toast.success('Connection request accepted')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to accept request')
      }
    })
  )

  const rejectMutation = useMutation(
    orpc.connection.reject.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['connection', 'pending'] })
        toast.success('Connection request rejected')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to reject request')
      }
    })
  )

  const handleAccept = (connectionId: string) => {
    acceptMutation.mutate({ connectionId })
  }

  const handleReject = (connectionId: string) => {
    rejectMutation.mutate({ connectionId })
  }

  const renderRequestCard = (
    connection: NonNullable<typeof receivedData>['connections'][0],
    type: 'received' | 'sent'
  ) => {
    const user = connection.user
    if (!user) return null

    return (
      <Card className="transition-shadow hover:shadow-md" key={connection.id}>
        <CardContent className="p-6">
          <div className="mb-4 flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="truncate font-semibold">{user.name}</h3>
                {user.isVerified && (
                  <Badge className="text-xs" variant="secondary">
                    Verified
                  </Badge>
                )}
              </div>
              {user.username && (
                <p className="truncate text-muted-foreground text-sm">
                  @{user.username}
                </p>
              )}
            </div>
          </div>

          {user.bio && (
            <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
              {user.bio}
            </p>
          )}

          <div className="flex gap-2">
            {type === 'received' ? (
              <>
                <Button
                  disabled={
                    acceptMutation.isPending || rejectMutation.isPending
                  }
                  onClick={() => handleAccept(connection.id)}
                  size="sm"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Accept
                </Button>
                <Button
                  disabled={
                    acceptMutation.isPending || rejectMutation.isPending
                  }
                  onClick={() => handleReject(connection.id)}
                  size="sm"
                  variant="outline"
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </>
            ) : (
              <Button disabled size="sm" variant="outline">
                <UserPlus className="mr-1 h-4 w-4" />
                Pending
              </Button>
            )}
            <Button asChild size="sm" variant="ghost">
              <a href={`/${user.username || user.id}`}>View Profile</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEmptyState = (type: 'received' | 'sent') => (
    <div className="py-12 text-center">
      <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 font-semibold text-lg">No pending requests</h3>
      <p className="text-muted-foreground">
        {type === 'received'
          ? "You don't have any connection requests at the moment"
          : "You haven't sent any connection requests"}
      </p>
    </div>
  )

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton loaders
        <Card key={`skeleton-${i}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <UserPlus className="h-8 w-8" />
          <h1 className="font-bold text-3xl">Connection Requests</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your pending connection requests
        </p>
      </div>

      <Tabs className="w-full" defaultValue="received">
        <TabsList className="mb-6">
          <TabsTrigger value="received">
            Received {!isLoadingReceived && `(${receivedRequests.length})`}
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent {!isLoadingSent && `(${sentRequests.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {receivedError && (
            <div className="py-12 text-center">
              <p className="text-destructive">
                Error loading requests: {(receivedError as Error).message}
              </p>
            </div>
          )}
          {!receivedError && isLoadingReceived && renderSkeletons()}
          {!(receivedError || isLoadingReceived) &&
            receivedRequests.length === 0 &&
            renderEmptyState('received')}
          {!(receivedError || isLoadingReceived) &&
            receivedRequests.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {receivedRequests.map((connection) =>
                  renderRequestCard(connection, 'received')
                )}
              </div>
            )}
        </TabsContent>

        <TabsContent value="sent">
          {sentError && (
            <div className="py-12 text-center">
              <p className="text-destructive">
                Error loading requests: {(sentError as Error).message}
              </p>
            </div>
          )}
          {!sentError && isLoadingSent && renderSkeletons()}
          {!(sentError || isLoadingSent) &&
            sentRequests.length === 0 &&
            renderEmptyState('sent')}
          {!(sentError || isLoadingSent) && sentRequests.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sentRequests.map((connection) =>
                renderRequestCard(connection, 'sent')
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
