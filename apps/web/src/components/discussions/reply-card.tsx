import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { useQueryClient } from '@tanstack/react-query'
import api, { useMutation } from '@web/lib/api-client'
import { ArrowDown, ArrowUp, MessageSquare, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Reply } from './types'

type ReplyCardProps = {
  reply: Reply
}

export function ReplyCard({ reply }: ReplyCardProps) {
  const [showActions, setShowActions] = useState(false)
  const queryClient = useQueryClient()

  const voteMutation = useMutation(
    (data: { threadId?: string; replyId?: string; voteType: 'up' | 'down' }) =>
      api.discussion.vote.vote.post(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['discussion', 'thread', 'get', reply.threadId]
        })
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to vote')
      }
    }
  )

  const unvoteMutation = useMutation(
    (data: { threadId?: string; replyId?: string }) =>
      api.discussion.vote.unvote.delete(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['discussion', 'thread', 'get', reply.threadId]
        })
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : 'Failed to remove vote'
        )
      }
    }
  )

  const handleUpvote = () => {
    if (reply.votes.userVote === 'up') {
      unvoteMutation.mutate({ replyId: reply.id })
    } else {
      voteMutation.mutate({ replyId: reply.id, voteType: 'up' })
    }
  }

  const handleDownvote = () => {
    if (reply.votes.userVote === 'down') {
      unvoteMutation.mutate({ replyId: reply.id })
    } else {
      voteMutation.mutate({ replyId: reply.id, voteType: 'down' })
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={reply.author.image ?? undefined} />
          <AvatarFallback>
            {reply.author.name
              ?.split(' ')
              .map((n) => n[0])
              .join('') ?? '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-semibold text-sm">
              {reply.author.name ?? 'Anonymous'}
            </span>
            <span className="text-muted-foreground text-xs">
              {reply.createdAt}
            </span>
            {'isEndorsed' in reply && reply.isEndorsed && (
              <span className="text-muted-foreground text-xs">(endorsed)</span>
            )}
          </div>

          <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
        </div>

        <div className="relative">
          <Button
            onClick={() => setShowActions(!showActions)}
            size="sm"
            variant="ghost"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <Button
            disabled={voteMutation.isPending || unvoteMutation.isPending}
            onClick={handleUpvote}
            size="sm"
            variant={reply.votes.userVote === 'up' ? 'default' : 'ghost'}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <span className="font-semibold text-xs">{reply.votes.upvotes}</span>
          <Button
            disabled={voteMutation.isPending || unvoteMutation.isPending}
            onClick={handleDownvote}
            size="sm"
            variant={reply.votes.userVote === 'down' ? 'default' : 'ghost'}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>

        <Button size="sm" variant="ghost">
          <MessageSquare className="mr-1 h-3 w-3" />
          Reply
        </Button>
      </div>
    </div>
  )
}
