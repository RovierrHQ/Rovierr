import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@rov/ui/components/dropdown-menu'
import { useQueryClient } from '@tanstack/react-query'
import { Image } from '@unpic/react'
import { mockPosts } from '@web/data/space-club-data'
import api, { useMutation, useQuery } from '@web/lib/api-client'
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Share2,
  Star,
  X
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

const ClubPostFeed = () => {
  const queryClient = useQueryClient()
  const observerTarget = useRef<HTMLDivElement>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['campus-feed', 'posts'],
    queryFn: () =>
      api['campus-feed'].posts.get({ query: { limit: 20, offset: 0 } }),
    select: (res) => res?.posts || []
  })

  const likeMutation = useMutation(
    (postId: string) =>
      api['campus-feed'].interactions.posts({ postId }).like.post(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['campus-feed', 'posts'] })
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to like post')
      }
    }
  )

  const rsvpMutation = useMutation(api['campus-feed'].events.rsvp.post, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campus-feed', 'posts'] })
      toast.success('RSVP updated successfully')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update RSVP')
    }
  })

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId)
  }

  const handleRSVP = (
    eventPostId: string,
    status: 'going' | 'interested' | 'not_going'
  ) => {
    rsvpMutation.mutate({ eventPostId, status })
  }

  // const getRSVPButtonContent = (
  //   currentUserRSVP?: 'going' | 'interested' | 'not_going'
  // ) => {
  //   switch (currentUserRSVP) {
  //     case 'going':
  //       return { icon: Check, text: 'Going', variant: 'default' as const }
  //     case 'interested':
  //       return { icon: Star, text: 'Interested', variant: 'default' as const }
  //     case 'not_going':
  //       return { icon: X, text: 'Not Going', variant: 'secondary' as const }
  //     default:
  //       return { icon: Calendar, text: 'RSVP', variant: 'default' as const }
  //   }
  // }

  // const formatTimestamp = (timestamp: string) => {
  //   const date = new Date(timestamp)
  //   const now = new Date()
  //   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  //   if (diffInSeconds < 60) return 'Just now'
  //   if (diffInSeconds < 3600)
  //     return `${Math.floor(diffInSeconds / 60)} minutes ago`
  //   if (diffInSeconds < 86_400)
  //     return `${Math.floor(diffInSeconds / 3600)} hours ago`
  //   if (diffInSeconds < 604_800)
  //     return `${Math.floor(diffInSeconds / 86_400)} days ago`
  //   return date.toLocaleDateString()
  // }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Use mock data if API fails
  const posts = error ? mockPosts : data || []

  if (posts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          {error
            ? 'Sample posts while we connect to the server'
            : 'No posts yet. Be the first to post!'}
        </p>
      </Card>
    )
  }

  return (
    <div className="relative flex gap-4">
      <div
        className={`space-y-4 transition-all ${selectedPostId ? 'w-1/2' : 'w-full'}`}
      >
        {posts.map((post) => (
          <Card
            className={`isolate p-6 transition-all ${
              selectedPostId === post.id
                ? 'border-primary shadow-lg ring-2 ring-primary/20'
                : ''
            }`}
            key={post.id}
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar || undefined} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{post.author.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {post.author.role}
                    </div>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {post.timestamp}
                  </div>
                </div>

                <div className="prose prose-sm mb-4 max-w-none leading-relaxed">
                  {post.content}
                </div>
                {post.image && (
                  <Image
                    alt="Post content"
                    className="mb-4 w-full rounded-lg"
                    layout="fullWidth"
                    src={post.image}
                  />
                )}
                {post.type === 'event' && post.eventDetails && (
                  <Card className="mb-4 bg-accent p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{post.eventDetails.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{post.eventDetails.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{post.eventDetails.location}</span>
                      </div>
                    </div>
                  </Card>
                )}
                <div className="flex items-center gap-6">
                  <Button
                    className="flex items-center gap-2 transition-colors hover:text-foreground"
                    onClick={() => handleLike(post.id)}
                    variant="secondary"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{post.likes}</span>
                  </Button>
                  <Button
                    className="flex items-center gap-2 transition-colors hover:text-foreground"
                    onClick={() => setSelectedPostId(post.id)}
                    variant="secondary"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{post.comments}</span>
                  </Button>
                  <Button
                    className="flex items-center gap-2 transition-colors hover:text-foreground"
                    variant="secondary"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </Button>
                  {post.type === 'event' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="ml-auto gap-2"
                          disabled={rsvpMutation.isPending}
                          size="sm"
                          variant="default"
                        >
                          <Calendar className="h-4 w-4" />
                          RSVP ({post.eventDetails?.attendees || 0})
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleRSVP(post.id.toString(), 'going')
                          }
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Going
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleRSVP(post.id.toString(), 'interested')
                          }
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Interested
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleRSVP(post.id.toString(), 'not_going')
                          }
                        >
                          <X className="mr-2 h-4 w-4" />
                          Not Going
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Infinite scroll trigger */}
        <div className="py-4 text-center" ref={observerTarget}>
          {error && (
            <div className="text-sm text-muted-foreground">
              Showing sample posts while connecting to server...
            </div>
          )}
        </div>
      </div>

      {/* Comment Panel - Placeholder for now */}
      {selectedPostId && (
        <Card className="w-1/2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Comments</h3>
            <Button
              onClick={() => setSelectedPostId(null)}
              size="sm"
              variant="ghost"
            >
              Close
            </Button>
          </div>
          <p className="text-muted-foreground text-center py-8">
            Comments coming soon...
          </p>
        </Card>
      )}
    </div>
  )
}

export default ClubPostFeed
