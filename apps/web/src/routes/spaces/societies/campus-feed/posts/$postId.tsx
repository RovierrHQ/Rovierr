import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@rov/ui/components/dropdown-menu'
import { Input } from '@rov/ui/components/input'
import { Separator } from '@rov/ui/components/separator'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { mockPosts } from '@web/data/space-club-data'
import api, { useMutation, useQuery } from '@web/lib/api-client'
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Send,
  Share2,
  Star,
  X
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/spaces/societies/campus-feed/posts/$postId'
)({
  component: PostDetailPage
})

function PostDetailPage() {
  const { postId } = Route.useParams()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')

  const {
    data: post,
    isLoading,
    error
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => api['campus-feed'].posts({ postId }).get(),
    enabled: !!postId
  })

  const likeMutation = useMutation(
    () => api['campus-feed'].interactions.posts({ postId }).like.post(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['post', postId] })
        queryClient.invalidateQueries({ queryKey: ['campus-feed', 'posts'] })
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to like post')
      }
    }
  )

  const commentMutation = useMutation(
    (content: string) =>
      api['campus-feed'].posts({ postId }).comments.post({ content }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['post', postId] })
        setComment('')
        toast.success('Comment added successfully!')
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : 'Failed to add comment'
        )
      }
    }
  )

  const rsvpMutation = useMutation(
    (status: 'going' | 'interested' | 'not_going') =>
      api['campus-feed'].events.rsvp.post({ eventPostId: postId, status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['post', postId] })
        queryClient.invalidateQueries({ queryKey: ['campus-feed', 'posts'] })
        toast.success('RSVP updated successfully!')
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : 'Failed to update RSVP'
        )
      }
    }
  )

  const handleLike = () => {
    likeMutation.mutate()
  }

  const handleComment = () => {
    if (!comment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }
    commentMutation.mutate(comment)
  }

  const handleRSVP = (status: 'going' | 'interested' | 'not_going') => {
    rsvpMutation.mutate(status)
  }

  const getRSVPButtonContent = (
    currentUserRSVP?: 'going' | 'interested' | 'not_going'
  ) => {
    switch (currentUserRSVP) {
      case 'going':
        return { icon: Check, text: 'Going', variant: 'default' as const }
      case 'interested':
        return { icon: Star, text: 'Interested', variant: 'default' as const }
      case 'not_going':
        return { icon: X, text: 'Not Going', variant: 'secondary' as const }
      default:
        return { icon: Calendar, text: 'RSVP', variant: 'default' as const }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Use mock data if API fails
  const postDetail = error
    ? mockPosts.find((p) => p.id.toString() === postId)
    : post

  if (!postDetail) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Post not found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button
        className="mb-6"
        onClick={() => window.history.back()}
        variant="ghost"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Feed
      </Button>

      {/* Post Content */}
      <Card className="mb-6 p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={postDetail.author.avatar || undefined} />
            <AvatarFallback>{postDetail.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="font-semibold text-lg">
                  {postDetail.author.name}
                </div>
                <div className="text-muted-foreground text-sm">
                  {postDetail.author.role}
                </div>
                <div className="text-muted-foreground text-sm">
                  {postDetail.timestamp}
                </div>
              </div>
            </div>

            <div className="prose prose-sm mb-4 max-w-none leading-relaxed">
              {postDetail.content}
            </div>

            {postDetail.image && (
              <div
                aria-label="Post content image"
                className="mb-4 w-full rounded-lg bg-cover bg-center bg-no-repeat"
                role="img"
                style={{
                  backgroundImage: `url(${postDetail.image})`,
                  paddingBottom: '56.25%' // 16:9 aspect ratio
                }}
              />
            )}

            {postDetail.type === 'event' && postDetail.eventDetails && (
              <Card className="mb-4 bg-accent p-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{postDetail.eventDetails.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{postDetail.eventDetails.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{postDetail.eventDetails.location}</span>
                  </div>
                </div>
              </Card>
            )}

            <Separator className="my-4" />

            {/* Interaction Buttons */}
            <div className="flex items-center gap-6">
              <Button
                className="flex items-center gap-2 transition-colors hover:text-foreground"
                onClick={handleLike}
                variant="secondary"
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm">{postDetail.likes}</span>
              </Button>
              <Button
                className="flex items-center gap-2 transition-colors hover:text-foreground"
                variant="secondary"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{postDetail.comments}</span>
              </Button>
              <Button
                className="flex items-center gap-2 transition-colors hover:text-foreground"
                variant="secondary"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </Button>
              {postDetail.type === 'event' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="ml-auto gap-2"
                      disabled={rsvpMutation.isPending}
                      size="sm"
                      variant="default"
                    >
                      {(() => {
                        const { icon: Icon, text } = getRSVPButtonContent()
                        return (
                          <>
                            <Icon className="h-4 w-4" />
                            {text} ({postDetail.eventDetails?.attendees || 0})
                            <ChevronDown className="h-3 w-3" />
                          </>
                        )
                      })()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRSVP('going')}>
                      <Check className="mr-2 h-4 w-4" />
                      Going
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRSVP('interested')}>
                      <Star className="mr-2 h-4 w-4" />
                      Interested
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRSVP('not_going')}>
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

      {/* Comments Section */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold text-lg">Comments</h3>

        {/* Add Comment */}
        <div className="mb-6 flex gap-2">
          <Input
            className="flex-1"
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            value={comment}
          />
          <Button
            disabled={!comment.trim() || commentMutation.isPending}
            onClick={handleComment}
          >
            {commentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {error && (
            <p className="text-center text-muted-foreground text-sm">
              Comments will appear here when connected to server...
            </p>
          )}
          {!error && (!postDetail.comments || postDetail.comments === 0) && (
            <p className="text-center text-muted-foreground text-sm">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
