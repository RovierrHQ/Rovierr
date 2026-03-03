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
import { createFileRoute } from '@tanstack/react-router'
import api from '@web/lib/api-client'
import { Check, UserPlus, Users, X } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/people/requests')({
  component: ConnectionRequestsPage
})

function ConnectionRequestsPage() {
  const queryClient = useQueryClient()

  // --- Queries ---

  const {
    data: receivedRequests = [],
    isLoading: isLoadingReceived,
    error: receivedError
  } = useQuery({
    queryKey: ['connection', 'pending', 'received'],
    queryFn: async () => {
      const { data, error } = await api.connection.pending.get({
        query: { type: 'received', limit: 100, offset: 0 }
      })
      if (error) throw error
      return data?.connections ?? []
    }
  })

  const {
    data: sentRequests = [],
    isLoading: isLoadingSent,
    error: sentError
  } = useQuery({
    queryKey: ['connection', 'pending', 'sent'],
    queryFn: async () => {
      const { data, error } = await api.connection.pending.get({
        query: { type: 'sent', limit: 100, offset: 0 }
      })
      if (error) throw error
      return data?.connections ?? []
    }
  })

  // --- Mutations ---

  const acceptMutation = useMutation({
    mutationFn: async ({ connectionId }: { connectionId: string }) => {
      const { data, error } = await api.connection.accept.post({ connectionId })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection', 'pending'] })
      queryClient.invalidateQueries({ queryKey: ['people', 'list'] })
      toast.success('Connection request accepted')
    },
    onError: (error: { value?: { message?: string } }) => {
      toast.error(error?.value?.message || 'Failed to accept request')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ connectionId }: { connectionId: string }) => {
      const { data, error } = await api.connection.reject.post({ connectionId })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection', 'pending'] })
      toast.success('Connection request rejected')
    },
    onError: (error: { value?: { message?: string } }) => {
      toast.error(error?.value?.message || 'Failed to reject request')
    }
  })

  // --- Handlers ---

  const handleAccept = (connectionId: string) => {
    acceptMutation.mutate({ connectionId })
  }

  const handleReject = (connectionId: string) => {
    rejectMutation.mutate({ connectionId })
  }

  // --- Render Helpers ---

  const renderRequestCard = (
    connection: {
      id: string
      user?: {
        id: string
        name?: string
        username?: string | null
        image?: string | null
        bio?: string | null
        isVerified?: boolean
      } | null
    },
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
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="truncate font-semibold">{user.name}</h3>
                {user.isVerified && <Badge variant="secondary">Verified</Badge>}
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
                  <Check className="mr-1 h-4 w-4" /> Accept
                </Button>
                <Button
                  disabled={
                    acceptMutation.isPending || rejectMutation.isPending
                  }
                  onClick={() => handleReject(connection.id)}
                  size="sm"
                  variant="outline"
                >
                  <X className="mr-1 h-4 w-4" /> Reject
                </Button>
              </>
            ) : (
              <Button disabled size="sm" variant="outline">
                <UserPlus className="mr-1 h-4 w-4" /> Pending
              </Button>
            )}
            <a
              className="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              href={`/${user.username || user.id}`}
            >
              View Profile
            </a>
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
          ? 'No requests at the moment'
          : "You haven't sent any requests"}
      </p>
    </div>
  )

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
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
            <p className="py-12 text-center text-destructive">
              Error loading requests
            </p>
          )}
          {isLoadingReceived ? (
            renderSkeletons()
          ) : receivedRequests.length === 0 ? (
            renderEmptyState('received')
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {receivedRequests.map((req) =>
                renderRequestCard(req, 'received')
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {sentError && (
            <p className="py-12 text-center text-destructive">
              Error loading requests
            </p>
          )}
          {isLoadingSent ? (
            renderSkeletons()
          ) : sentRequests.length === 0 ? (
            renderEmptyState('sent')
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sentRequests.map((req) => renderRequestCard(req, 'sent'))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
