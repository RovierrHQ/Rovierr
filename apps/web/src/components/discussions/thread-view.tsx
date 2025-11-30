import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Separator } from '@rov/ui/components/separator'
import { Textarea } from '@rov/ui/components/textarea'
import { ArrowUp, Check, MessageSquare, Pin, Send, X } from 'lucide-react'
import { useState } from 'react'
import { ReplyCard } from './reply-card'
import type { Discussion, Reply } from './types'

interface ThreadViewProps {
  discussion: Discussion
  replies: Reply[]
  onClose: () => void
}

export function ThreadView({ discussion, replies, onClose }: ThreadViewProps) {
  const [replyText, setReplyText] = useState('')

  const handleSendReply = () => {
    if (replyText.trim()) {
      // In real app, send to backend
      setReplyText('')
    }
  }

  return (
    <div className="flex w-1/2 flex-col border-border border-l pl-4">
      {/* Thread Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            {discussion.isPinned && <Pin className="h-4 w-4 text-primary" />}
            <h2 className="font-bold text-xl">{discussion.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {discussion.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {discussion.isResolved && (
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                <Check className="mr-1 h-3 w-3" />
                Resolved
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={onClose} size="sm" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Thread Content */}
      <div className="flex-1 overflow-y-auto pr-4">
        <div className="space-y-4">
          {/* Original Post */}
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={discussion.author.avatar || undefined} />
                <AvatarFallback>
                  {discussion.author.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold">
                    {discussion.author.name}
                  </span>
                  <Badge className="text-xs" variant="outline">
                    {discussion.author.role}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {discussion.createdAt}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm">
                  {discussion.content}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button size="sm" variant="ghost">
                <ArrowUp className="mr-1 h-3 w-3" />
                {discussion.upvotes}
              </Button>
              <Button size="sm" variant="ghost">
                <MessageSquare className="mr-1 h-3 w-3" />
                Reply
              </Button>
            </div>
          </div>

          {/* Replies */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-sm">
                {replies.length} replies
              </span>
              <Separator className="flex-1" />
            </div>

            {replies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        </div>
      </div>

      {/* Reply Input */}
      <div className="mt-4 border-border border-t pt-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              className="min-h-[80px] resize-none"
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSendReply()
                }
              }}
              placeholder="Write your reply..."
              value={replyText}
            />
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                Press ⌘+Enter to send
              </p>
              <Button
                disabled={!replyText.trim()}
                onClick={handleSendReply}
                size="sm"
              >
                <Send className="mr-2 h-3 w-3" />
                Send Reply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
