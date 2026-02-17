import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Card } from '@rov/ui/components/card'
import { Lock, MessageSquare, Pin, TrendingUp } from 'lucide-react'
import type { ThreadListItem } from './types'

type DiscussionListProps = {
  threads: ThreadListItem[]
  loading?: boolean
  onThreadClick?: (threadId: string) => void
}

export function DiscussionList({
  threads,
  loading,
  onThreadClick
}: DiscussionListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card className="p-6" key={`skeleton-${index}`}>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
        <p className="text-muted-foreground">
          Be the first to start a discussion!
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <Card className="p-6 hover:shadow-md transition-shadow" key={thread.id}>
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={thread.author.image ?? undefined} />
              <AvatarFallback>{thread.author.name?.[0] ?? '?'}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {thread.isPinned && (
                      <Pin className="h-4 w-4 text-muted-foreground" />
                    )}
                    {thread.isLocked && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <button
                      className="font-semibold hover:text-primary transition-colors text-left"
                      onClick={() => onThreadClick?.(thread.id)}
                      type="button"
                    >
                      {thread.title}
                    </button>
                  </div>

                  <div className="text-sm text-muted-foreground mb-2">
                    by {thread.author.name ?? 'Anonymous'} •{' '}
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </div>

                  <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {thread.content}
                  </div>

                  {(thread.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(thread.tags ?? []).map((tag) => (
                        <Badge
                          className="text-xs"
                          key={tag}
                          variant="secondary"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {thread.votes.upvotes - thread.votes.downvotes}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {thread.replyCount}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
