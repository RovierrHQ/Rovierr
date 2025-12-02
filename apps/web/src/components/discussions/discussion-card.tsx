import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent, CardHeader } from '@rov/ui/components/card'
import { Separator } from '@rov/ui/components/separator'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Check, MessageSquare, Pin } from 'lucide-react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import type { Discussion } from './types'

interface DiscussionCardProps {
  discussion: Discussion
  isSelected?: boolean
  onClick: () => void
  userVote?: 'up' | 'down' | null
}

export function DiscussionCard({
  discussion,
  isSelected,
  onClick,
  userVote
}: DiscussionCardProps) {
  const queryClient = useQueryClient()

  const voteMutation = useMutation(
    orpc.discussion.vote.vote.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.discussion.thread.list.queryKey({
            input: {
              contextType: discussion.contextType,
              contextId: discussion.contextId
            }
          })
        })
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to vote')
      }
    })
  )

  const unvoteMutation = useMutation(
    orpc.discussion.vote.unvote.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.discussion.thread.list.queryKey({
            input: {
              contextType: discussion.contextType,
              contextId: discussion.contextId
            }
          })
        })
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to remove vote')
      }
    })
  )

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (userVote === 'up') {
      unvoteMutation.mutate({ threadId: discussion.id })
    } else {
      voteMutation.mutate({ threadId: discussion.id, voteType: 'up' })
    }
  }

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (userVote === 'down') {
      unvoteMutation.mutate({ threadId: discussion.id })
    } else {
      voteMutation.mutate({ threadId: discussion.id, voteType: 'down' })
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? 'border-primary bg-accent' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              {discussion.isPinned && <Pin className="h-4 w-4 text-primary" />}
              <h3 className="font-semibold text-base leading-tight">
                {discussion.title}
              </h3>
            </div>

            <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
              {discussion.content}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {discussion.tags.slice(0, 2).map((tag) => (
                <Badge className="text-xs" key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {discussion.isResolved && (
                <Badge className="bg-green-500/10 text-green-700 text-xs dark:text-green-400">
                  <Check className="mr-1 h-3 w-3" />
                  Resolved
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              disabled={voteMutation.isPending || unvoteMutation.isPending}
              onClick={handleUpvote}
              size="sm"
              variant={userVote === 'up' ? 'default' : 'ghost'}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm">{discussion.upvotes}</span>
            <Button
              disabled={voteMutation.isPending || unvoteMutation.isPending}
              onClick={handleDownvote}
              size="sm"
              variant={userVote === 'down' ? 'default' : 'ghost'}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={discussion.author.avatar || undefined} />
              <AvatarFallback className="text-xs">
                {discussion.author.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-xs">{discussion.author.name}</p>
              <p className="text-muted-foreground text-xs">
                {discussion.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MessageSquare className="h-4 w-4" />
            <span>{discussion.replies}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
