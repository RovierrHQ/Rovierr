'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Separator } from '@rov/ui/components/separator'
import { Textarea } from '@rov/ui/components/textarea'
import api, { useMutation, useQuery } from '@web/lib/api-client'
import { authClient } from '@web/lib/auth-client'
import { Heart, Loader2, Send, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type PostCommentPanelProps = {
  postId: string
  onClose: () => void
}

export function PostCommentPanel({ postId, onClose }: PostCommentPanelProps) {
  const [commentText, setCommentText] = useState('')
  const { data: session } = authClient.useSession()

  const { data, isLoading } = useQuery({
    queryKey: ['campus-feed', 'comments', postId],
    queryFn: () =>
      api['campus-feed'].interactions.posts({ postId }).comments.get({
        query: { limit: 50, offset: 0, postId }
      })
  })

  const commentMutation = useMutation(
    api['campus-feed'].interactions.comments.post,
    {
      onSuccess: () => {
        toast.success('Comment posted successfully')
        setCommentText('')
      },
      onError: (error) => {
        toast.error(error.value.message || 'Failed to post comment')
      }
    }
  )

  const likeCommentMutation = useMutation((commentId: string) =>
    api['campus-feed'].interactions.comments({ commentId }).like.post()
  )

  const handleSubmit = () => {
    if (commentText.trim()) {
      commentMutation.mutate({
        postId,
        content: commentText
      })
    }
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

  return (
    <div className="sticky top-28 flex h-[calc(100vh-200px)] w-1/2 flex-col border-border border-l pl-4">
      {/* Header */}
      <div className="mb-4 flex shrink-0 items-start justify-between">
        <div className="flex-1">
          <h2 className="font-bold text-xl">Comments</h2>
        </div>
        <Button onClick={onClose} size="sm" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments List - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-sm">
                {data?.total || 0} comments
              </span>
              <Separator className="flex-1" />
            </div>

            {data?.comments.map((comment) => (
              <div className="rounded-lg border bg-card p-4" key={comment.id}>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar || undefined} />
                    <AvatarFallback>
                      {comment.author.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {comment.author.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-sm"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: expected
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        className="flex items-center gap-2 transition-colors hover:text-foreground"
                        disabled={likeCommentMutation.isPending}
                        onClick={() => likeCommentMutation.mutate(comment.id)}
                        size="sm"
                        variant="secondary"
                      >
                        <Heart
                          className={`h-4 w-4 ${comment.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''}`}
                        />
                        <span className="text-sm">{comment.likeCount}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {data?.comments.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment Input - Fixed at bottom */}
      <div className="shrink-0 border-border border-t pt-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback>
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              className="min-h-[80px] resize-none"
              disabled={commentMutation.isPending}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit()
                }
              }}
              placeholder="Write a comment..."
              value={commentText}
            />
            <div className="flex justify-end">
              <Button
                disabled={!commentText.trim() || commentMutation.isPending}
                onClick={handleSubmit}
                size="sm"
              >
                {commentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
