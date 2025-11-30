import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { ArrowUp, Check } from 'lucide-react'
import type { Reply } from './types'

interface ReplyCardProps {
  reply: Reply
}

export function ReplyCard({ reply }: ReplyCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        reply.isAnswer ? 'border-green-500/50 bg-green-500/5' : 'bg-card'
      }`}
    >
      <div className="mb-3 flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={reply.author.avatar || undefined} />
          <AvatarFallback className="text-xs">
            {reply.author.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-semibold text-sm">{reply.author.name}</span>
            <Badge className="text-xs" variant="outline">
              {reply.author.role}
            </Badge>
            {reply.isAnswer && (
              <Badge className="bg-green-500 text-white text-xs">
                <Check className="mr-1 h-3 w-3" />
                Answer
              </Badge>
            )}
            <span className="text-muted-foreground text-xs">
              {reply.createdAt}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button size="sm" variant="ghost">
          <ArrowUp className="mr-1 h-3 w-3" />
          {reply.upvotes}
        </Button>
        {!reply.isAnswer && (
          <Button size="sm" variant="ghost">
            Mark as Answer
          </Button>
        )}
      </div>
    </div>
  )
}
