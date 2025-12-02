'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Share2
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import { PostCommentPanel } from './post-comment-panel'

const ClubPostFeed = () => {
  const queryClient = useQueryClient()
  const observerTarget = useRef<HTMLDivElement>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['campus-feed', 'posts'],
    queryFn: async ({ pageParam = 0 }) => {
      return await orpc.campusFeed.list.call({ limit: 20, offset: pageParam })
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.hasMore) {
        return pages.length * 20
      }
      return
    },
    initialPageParam: 0
  })

  const likeMutation = useMutation(
    orpc.campusFeed.like.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['campus-feed', 'posts'] })
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to like post')
      }
    })
  )

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleLike = (postId: string) => {
    likeMutation.mutate({ postId })
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86_400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604_800)
      return `${Math.floor(diffInSeconds / 86_400)} days ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Failed to load posts. Please try again.
        </p>
      </Card>
    )
  }

  const posts = data?.pages.flatMap((page) => page.posts) || []

  if (posts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          No posts yet. Be the first to post!
        </p>
      </Card>
    )
  }

  return (
    <div className="flex gap-4">
      <div className={`space-y-4 ${selectedPostId ? 'w-1/2' : 'w-full'}`}>
        {posts.map((post) => (
          <Card className="isolate p-6" key={post.id}>
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
                    {formatTimestamp(post.createdAt)}
                  </div>
                </div>

                <div
                  className="prose prose-sm mb-4 max-w-none leading-relaxed"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: expected
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                {post.imageUrl && (
                  <img
                    alt="Post content"
                    className="mb-4 w-full rounded-lg"
                    src={post.imageUrl}
                  />
                )}
                {post.type === 'event' && post.eventDetails && (
                  <Card className="mb-4 bg-accent p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{post.eventDetails.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{post.eventDetails.eventTime}</span>
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
                    <Heart
                      className={`h-4 w-4 ${post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    <span className="text-sm">{post.likeCount}</span>
                  </Button>
                  <Button
                    className="flex items-center gap-2 transition-colors hover:text-foreground"
                    onClick={() => setSelectedPostId(post.id)}
                    variant="secondary"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{post.commentCount}</span>
                  </Button>
                  <Button
                    className="flex items-center gap-2 transition-colors hover:text-foreground"
                    variant="secondary"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </Button>
                  {post.type === 'event' && (
                    <Button className="ml-auto" size="sm">
                      RSVP ({post.rsvpCount || 0})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Infinite scroll trigger */}
        <div className="py-4 text-center" ref={observerTarget}>
          {isFetchingNextPage && (
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          )}
        </div>
      </div>

      {/* Comment Panel */}
      {selectedPostId && (
        <PostCommentPanel
          onClose={() => setSelectedPostId(null)}
          postId={selectedPostId}
        />
      )}
    </div>
  )
}

export default ClubPostFeed
